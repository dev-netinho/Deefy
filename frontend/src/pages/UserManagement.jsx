import { createElement, useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { adminService } from "../services/adminService";
import { showMusicError, showMusicSuccess } from "../utils/musicToast";
import ButtonSpinner from "../components/ButtonSpinner";
import { getSearchableText, matchesSearchText } from "../utils/search";
import {
  MdPeople, MdPersonOff, MdDelete, MdEdit, MdSave, MdClose,
  MdBlock, MdCheckCircle, MdAdminPanelSettings, MdPerson,
  MdSearch, MdRefresh, MdWarning, MdVerifiedUser, MdWifi,
} from "react-icons/md";
import "./UserManagement.css";

/* ── helpers ─────────────────────────────────────────────── */
function fmtDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
function avatarInitials(user) {
  const name = user.name || user.username || user.email || "?";
  return name.slice(0, 2).toUpperCase();
}
function roleLabel(role) {
  if (role === "ROLE_ADMIN" || role === "ADMIN") return "Admin";
  return "Usuário";
}

/* ── Stat card ───────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, accent, onClick, active }) {
  return (
    <button type="button" className={`um-stat-card${active ? " um-stat-card--active" : ""}`} style={{ "--um-accent": accent }} onClick={onClick}>
      <div className="um-stat-icon">{createElement(Icon)}</div>
      <div className="um-stat-info">
        <p className="um-stat-value">{value ?? "—"}</p>
        <p className="um-stat-label">{label}</p>
      </div>
    </button>
  );
}

/* ── Confirm modal ───────────────────────────────────────── */
function ConfirmModal({ title, message, danger, onConfirm, onCancel, loading }) {
  return (
    <div className="um-modal-overlay" onClick={onCancel}>
      <div className="um-modal" onClick={e => e.stopPropagation()}>
        <div className="um-modal-head">
          <MdWarning className={danger ? "um-modal-icon--danger" : "um-modal-icon--warn"} />
          <h3>{title}</h3>
        </div>
        <p className="um-modal-msg">{message}</p>
        <div className="um-modal-actions">
          <button className="um-btn-ghost" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button className={`um-btn-confirm${danger ? " um-btn-confirm--danger" : ""}`} onClick={onConfirm} disabled={loading}>
            {loading ? <ButtonSpinner color="#fff" /> : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Edit modal ──────────────────────────────────────────── */
function EditModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({
    name:     user.name     || "",
    email:    user.email    || "",
    username: user.username || "",
    role:     user.role     || "ROLE_USER",
  });
  const [loading, setLoading] = useState(false);
  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return showMusicError("Nome e e-mail são obrigatórios.");
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="um-modal-overlay" onClick={onClose}>
      <div className="um-modal um-modal--wide" onClick={e => e.stopPropagation()}>
        <div className="um-modal-head">
          <MdEdit className="um-modal-icon--edit" />
          <h3>Editar usuário</h3>
          <button className="um-modal-close" onClick={onClose}><MdClose /></button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="um-modal-grid">
            <div className="um-field">
              <label className="um-label" htmlFor="eu-name">Nome <span className="um-req">*</span></label>
              <input id="eu-name" name="name" className="um-input" value={form.name} onChange={set} disabled={loading} autoComplete="off" />
            </div>
            <div className="um-field">
              <label className="um-label" htmlFor="eu-username">Username</label>
              <input id="eu-username" name="username" className="um-input" value={form.username} onChange={set} disabled={loading} autoComplete="off" />
            </div>
            <div className="um-field um-field--full">
              <label className="um-label" htmlFor="eu-email">E-mail <span className="um-req">*</span></label>
              <input id="eu-email" name="email" className="um-input" type="email" value={form.email} onChange={set} disabled={loading} autoComplete="off" />
            </div>
            <div className="um-field">
              <label className="um-label" htmlFor="eu-role">Papel (Role)</label>
              <select id="eu-role" name="role" className="um-input um-select" value={form.role} onChange={set} disabled={loading}>
                <option value="ROLE_USER">Usuário</option>
                <option value="ROLE_ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <p className="um-modal-warning">
            ⚠️ Dados sensíveis. A alteração de e-mail ou role é aplicada imediatamente e registrada nos logs do servidor.
          </p>
          <div className="um-modal-actions">
            <button type="button" className="um-btn-ghost" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className="um-btn-confirm" disabled={loading}>
              {loading ? <ButtonSpinner color="#fff" /> : <><MdSave /> Salvar alterações</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export default function UserManagement() {
  const [stats,   setStats]   = useState({ total: 0, active: 0, banned: 0, newThisMonth: 0, admins: 0, deleted: 0, offline: 0, online: 0 });
  const [users,   setUsers]   = useState([]);
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState([]); // 'active', 'banned', 'newThisMonth', 'admins'

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [editUser,    setEditUser]    = useState(null);
  const [confirmData, setConfirmData] = useState(null); // { title, message, danger, action }
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, u] = await Promise.all([adminService.getUserStats(), adminService.getUsers(currentPage, 20)]);
    
    setStats({ ...s });
    if (u && Array.isArray(u.content)) {
      setUsers(u.content);
      setTotalPages(u.totalPages || 1);
    } else {
      setUsers(Array.isArray(u) ? u : []);
      setTotalPages(1);
    }
    setLoading(false);
  }, [currentPage]);

  useEffect(() => { load(); }, [load]);

  /* ── filtered list ──────────────────────────────────────── */
  const filtered = users.filter(u => {
    // text search
    if (search) {
      if (!matchesSearchText(getSearchableText(u.name, u.email, u.username), search)) {
        return false;
      }
    }

    // filters
    if (filters.length > 0) {
      const isBanned = u.banned;
      const isAdmin  = u.role === "ROLE_ADMIN" || u.role === "ADMIN";
      const isDeleted = u.deleted === true;
      const isOffline = u.online !== true && u.status !== 'online';
      const isOnline  = u.online === true || u.status === 'online';
      
      const date = new Date(u.createdAt);
      const now = new Date();
      const isNew = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

      let matchedAny = false;
      if (filters.includes("active") && !isBanned && !isDeleted) matchedAny = true;
      if (filters.includes("banned") && isBanned) matchedAny = true;
      if (filters.includes("admins") && isAdmin) matchedAny = true;
      if (filters.includes("newThisMonth") && isNew) matchedAny = true;
      if (filters.includes("deleted") && isDeleted) matchedAny = true;
      if (filters.includes("offline") && isOffline) matchedAny = true;
      if (filters.includes("online") && isOnline) matchedAny = true;
      
      if (!matchedAny) return false;
    }

    return true;
  });

  const toggleFilter = (f) => setFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  /* ── actions ─────────────────────────────────────────────── */
  const execConfirm = async () => {
    if (!confirmData) return;
    setActionLoading(true);
    try {
      await confirmData.action();
      showMusicSuccess(confirmData.successMsg);
      setConfirmData(null);
      await load();
    } catch (err) {
      showMusicError(err?.response?.data?.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBan = (user) => {
    const banning = !user.banned;
    setConfirmData({
      title:      banning ? "Banir usuário" : "Desbanir usuário",
      message:    banning
        ? `Tem certeza que deseja banir "${user.name || user.email}"? O acesso dele será bloqueado imediatamente.`
        : `Deseja restaurar o acesso de "${user.name || user.email}"?`,
      danger:     banning,
      successMsg: banning ? "Usuário banido com sucesso." : "Usuário desbanido.",
      action:     () => adminService.setBanStatus(user.id, banning),
    });
  };

  const handleDelete = (user) => {
    setConfirmData({
      title:      "Excluir conta permanentemente",
      message:    `Esta ação é irreversível. A conta de "${user.name || user.email}" e todos os dados associados serão deletados.`,
      danger:     true,
      successMsg: "Conta excluída permanentemente.",
      action:     () => adminService.deleteUser(user.id),
    });
  };

  const handleSaveEdit = async (data) => {
    try {
      await adminService.updateUser(editUser.id, data);
      showMusicSuccess("Dados do usuário atualizados.");
      setEditUser(null);
      await load();
    } catch (err) {
      showMusicError(err?.response?.data?.message || "Erro ao salvar alterações.");
      throw err;
    }
  };

  /* ── render ───────────────────────────────────────────────── */
  return (
    <div className="um-layout">
      <Sidebar />
      <div className="um-main">

        {/* Header */}
        <div className="um-header">
          <div className="um-header-left">
            <MdPeople className="um-header-icon" />
            <div>
              <h1 className="um-title">Gerenciamento de Usuários</h1>
              <p className="um-subtitle">PAINEL ADMINISTRATIVO · DADOS SENSÍVEIS</p>
            </div>
          </div>
          <button className="um-refresh-btn" onClick={load} disabled={loading}>
            <MdRefresh className={loading ? "um-spin" : ""} /> Atualizar
          </button>
        </div>

        {/* Stats dashboard */}
        <div className="um-filter-row">
          <p className="um-filter-hint">Dica: clique nos cartões abaixo para filtrar a lista. Você pode selecionar mais de um filtro de uma vez.</p>
          {filters.length > 0 && <button className="um-filter-clear" onClick={() => setFilters([])}>Limpar filtros</button>}
        </div>
        <div className="um-stats-grid">
          <StatCard icon={MdPeople}              label="Total de usuários"    value={stats.total}        accent="#39f0d0" onClick={() => setFilters([])} active={filters.length === 0} />
          <StatCard icon={MdVerifiedUser}        label="Contas habilitadas"   value={stats.active}       accent="#4ade80" onClick={() => toggleFilter("active")} active={filters.includes("active")} />
          <StatCard icon={MdWifi}                label="Usuários online"      value={stats.online}       accent="#3b82f6" onClick={() => toggleFilter("online")} active={filters.includes("online")} />
          <StatCard icon={MdPersonOff}           label="Usuários offline"     value={stats.offline}      accent="#a0aec0" onClick={() => toggleFilter("offline")} active={filters.includes("offline")} />
          <StatCard icon={MdPerson}              label="Novos este mês"       value={stats.newThisMonth} accent="#e8b84b" onClick={() => toggleFilter("newThisMonth")} active={filters.includes("newThisMonth")} />
          <StatCard icon={MdAdminPanelSettings}  label="Administradores"      value={stats.admins}       accent="#a78bfa" onClick={() => toggleFilter("admins")} active={filters.includes("admins")} />
          <StatCard icon={MdBlock}               label="Banidos"              value={stats.banned}       accent="#f06060" onClick={() => toggleFilter("banned")} active={filters.includes("banned")} />
          <StatCard icon={MdDelete}              label="Excluídos"            value={stats.deleted}      accent="#888888" onClick={() => toggleFilter("deleted")} active={filters.includes("deleted")} />
        </div>

        {/* Search & table */}
        <div className="um-table-section">
          <div className="um-table-head">
            <h2 className="um-table-title">Lista de usuários</h2>
            <div className="um-search-box">
              <MdSearch />
              <input
                className="um-search-input"
                placeholder="Buscar por nome, e-mail ou username..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="um-loading"><ButtonSpinner color="#39f0d0" /><span>Carregando usuários...</span></div>
          ) : filtered.length === 0 ? (
            <div className="um-empty">Nenhum usuário encontrado.</div>
          ) : (
            <div className="um-table-wrap">
              <table className="um-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>E-mail</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Cadastro</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => {
                    const isBanned = u.banned;
                    const isAdmin  = u.role === "ROLE_ADMIN" || u.role === "ADMIN";
                    return (
                      <tr key={u.id} className={isBanned ? "um-row--banned" : ""}>
                        <td>
                          <div className="um-user-cell">
                            <div className="um-avatar" style={{ background: isAdmin ? "rgba(167,139,250,0.2)" : "rgba(57,240,208,0.12)" }}>
                              {u.photoUrl ? <img src={u.photoUrl} alt="" /> : <span>{avatarInitials(u)}</span>}
                            </div>
                            <div>
                              <p className="um-user-name">{u.name || u.username || "—"}</p>
                              {u.username && u.name && <p className="um-user-handle">@{u.username}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="um-cell-email">{u.email || "—"}</td>
                        <td>
                          <span className={`um-badge${isAdmin ? " um-badge--admin" : ""}`}>
                            {isAdmin && <MdAdminPanelSettings />} {roleLabel(u.role)}
                          </span>
                        </td>
                        <td>
                          <span className={`um-badge${isBanned ? " um-badge--banned" : " um-badge--active"}`}>
                            {isBanned ? <><MdBlock /> Banido</> : <><MdCheckCircle /> Ativo</>}
                          </span>
                        </td>
                        <td className="um-cell-date">{fmtDate(u.createdAt)}</td>
                        <td>
                          <div className="um-actions-cell">
                            <button
                              className="um-action-btn um-action-btn--edit"
                              onClick={() => setEditUser(u)}
                              title="Editar usuário"
                            >
                              <MdEdit />
                            </button>
                            <button
                              className={`um-action-btn${isBanned ? " um-action-btn--unban" : " um-action-btn--ban"}`}
                              onClick={() => handleBan(u)}
                              title={isBanned ? "Desbanir" : "Banir"}
                            >
                              {isBanned ? <MdCheckCircle /> : <MdBlock />}
                            </button>
                            <button
                              className="um-action-btn um-action-btn--delete"
                              onClick={() => handleDelete(u)}
                              title="Excluir conta"
                            >
                              <MdDelete />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="um-pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem', paddingBottom: '1rem' }}>
              <button 
                className="um-btn-ghost" 
                disabled={currentPage === 0 || loading} 
                onClick={() => setCurrentPage(p => p - 1)}
                style={{ padding: '0.5rem 1rem' }}
              >
                Anterior
              </button>
              <span style={{ color: '#a0aec0', fontSize: '0.9rem' }}>
                Página {currentPage + 1} de {totalPages}
              </span>
              <button 
                className="um-btn-ghost" 
                disabled={currentPage >= totalPages - 1 || loading} 
                onClick={() => setCurrentPage(p => p + 1)}
                style={{ padding: '0.5rem 1rem' }}
              >
                Próxima
              </button>
            </div>
          )}
          <p className="um-count">{filtered.length} usuário(s) nesta página</p>
        </div>
      </div>

      {/* Modals */}
      {editUser && <EditModal user={editUser} onSave={handleSaveEdit} onClose={() => setEditUser(null)} />}
      {confirmData && (
        <ConfirmModal
          title={confirmData.title}
          message={confirmData.message}
          danger={confirmData.danger}
          onConfirm={execConfirm}
          onCancel={() => setConfirmData(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
