import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { adminService } from "../services/adminService";
import { showMusicError, showMusicSuccess } from "../utils/musicToast";
import ButtonSpinner from "../components/ButtonSpinner";
import { MdMusicNote, MdPerson, MdAlbum, MdPlaylistAdd, MdAdd, MdCloudUpload, MdCheckCircle, MdAudiotrack, MdDelete } from "react-icons/md";
import { FiUser, FiDisc, FiMusic, FiList, FiTag } from "react-icons/fi";
import "./AdminPanel.css";

// GENRES are loaded dynamically from the API (no hardcoded list)

async function detectDuration(url) {
  return new Promise((res) => {
    const a = new Audio();
    const t = setTimeout(() => res(null), 8000);
    a.onloadedmetadata = () => { clearTimeout(t); res(isFinite(a.duration) ? Math.round(a.duration) : null); };
    a.onerror = () => { clearTimeout(t); res(null); };
    a.src = url;
  });
}

const TABS = [
  { id: "genres",    label: "Gêneros",   Icon: FiTag },
  { id: "artists",   label: "Artistas",  Icon: FiUser },
  { id: "albums",    label: "Álbuns",    Icon: FiDisc },
  { id: "musics",    label: "Músicas",   Icon: FiMusic },
  { id: "playlists", label: "Playlists", Icon: FiList },
];

export default function AdminPanel() {
  const [tab, setTab]         = useState("genres");
  const [stats, setStats]     = useState({ genres: 0, artists: 0, albums: 0, musics: 0, playlists: 0 });
  const [genres,  setGenres]  = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums,  setAlbums]  = useState([]);
  const [musics,  setMusics]  = useState([]);
  const [musicsLoaded, setMusicsLoaded] = useState(false);

  const reload = () => {
    adminService.getStats().then(setStats);
    adminService.getGenres().then(setGenres);
    adminService.getArtists().then(setArtists);
    adminService.getAlbums().then(setAlbums);
    adminService.getMusics()
      .then(data => { setMusics(data); setMusicsLoaded(true); })
      .catch(() => { setMusics([]); setMusicsLoaded(true); });
  };

  useEffect(() => { reload(); }, []);

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">

        {/* ── Top ─────────────────────────────────────────── */}
        <div className="admin-topbar">
          <div className="admin-topbar-brand">
            <MdMusicNote className="admin-topbar-icon" />
            <div>
              <h1 className="admin-topbar-title">Deefy Control Room</h1>
              <p className="admin-topbar-sub">STUDIO DE CATÁLOGO</p>
            </div>
          </div>
          <div className="admin-stats">
            {[["Gêneros", stats.genres],["Artistas", stats.artists],["Álbuns", stats.albums],["Faixas", stats.musics],["Playlists", stats.playlists]].map(([l, v]) => (
              <div key={l} className="admin-stat-card">
                <span className="admin-stat-value">{v}</span>
                <span className="admin-stat-label">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────── */}
        <div className="admin-body">
          {/* Left sidebar tabs */}
          <nav className="admin-tabs">
            <p className="admin-tabs-label">Áreas do studio</p>
            <p className="admin-tabs-hint">cada aba organiza o catálogo por tipo de conteúdo</p>
            {TABS.map(({ id, label, Icon }) => (
              <button key={id} className={`admin-tab${tab === id ? " admin-tab--active" : ""}`} onClick={() => setTab(id)}>
                <Icon /> {label}
              </button>
            ))}
            <div className="admin-tab-count">
              {tab === "genres"    && <><strong>Gêneros</strong><span>{stats.genres} registros ativos</span></>}
              {tab === "artists"   && <><strong>Artistas</strong><span>{stats.artists} registros ativos</span></>}
              {tab === "albums"    && <><strong>Álbuns</strong><span>{stats.albums} registros ativos</span></>}
              {tab === "musics"    && <><strong>Músicas</strong><span>{stats.musics} registros ativos</span></>}
              {tab === "playlists" && <><strong>Playlists</strong><span>{stats.playlists} registros ativos</span></>}
            </div>
          </nav>

          {/* Content */}
          <div className="admin-content">
            {tab === "genres"    && <GenresTab   genres={genres} onSuccess={reload} />}
            {tab === "artists"   && <ArtistsTab  onSuccess={reload} />}
            {tab === "albums"    && <AlbumsTab   artists={artists} onSuccess={reload} />}
            {tab === "musics"    && <MusicsTab   artists={artists} albums={albums} genres={genres} onSuccess={reload} />}
            {tab === "playlists" && <PlaylistsTab musics={musics} musicsLoaded={musicsLoaded} onSuccess={reload} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED HELPERS
═══════════════════════════════════════════════════════════ */
function EditorHeader({ title, desc, onNew }) {
  return (
    <div className="admin-ws-header">
      <div>
        <p className="admin-ws-kicker">WORKSPACE ATUAL</p>
        <h2 className="admin-ws-title">{title}</h2>
        <p className="admin-ws-desc">{desc}</p>
      </div>
      <button className="admin-new-btn" onClick={onNew}><MdAdd /> Novo registro</button>
    </div>
  );
}

function FormHeader({ onClear }) {
  return (
    <div className="admin-editor-head">
      <div><p className="admin-editor-kicker">EDITOR</p><h3 className="admin-editor-title">CRIAR REGISTRO</h3></div>
      <button type="button" className="admin-clear-btn" onClick={onClear}>Limpar</button>
    </div>
  );
}

function UploadBtn({ label, type = "image", onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      let res;
      if (type === "audio") {
        res = await adminService.uploadAudio(file);
      } else {
        res = await adminService.uploadImage(file);
      }
      if (res && res.url) {
        showMusicSuccess(`Upload concluído!`);
        onUploadSuccess?.(res.url);
      }
    } catch (err) {
      showMusicError(err?.response?.data?.message || "Erro ao fazer upload.");
    } finally {
      setUploading(false);
      e.target.value = null; // Reset input
    }
  };

  return (
    <label className={`admin-upload-btn${uploading ? " admin-upload-btn--loading" : ""}`} title={label}>
      <input 
        type="file" 
        accept={type === "audio" ? "audio/mp3,audio/wav,audio/ogg,audio/webm,audio/flac" : "image/jpeg,image/png,image/webp,image/gif"} 
        style={{ display: "none" }} 
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading ? <ButtonSpinner color="#e8b84b" /> : <MdCloudUpload />}
      <span>{uploading ? "Enviando..." : label}</span>
    </label>
  );
}

function PublishBtn({ isLoading, submitted }) {
  return (
    <button type="submit" className={`admin-publish-btn${submitted ? " admin-publish-btn--success" : ""}`} disabled={isLoading}>
      {isLoading ? <ButtonSpinner color="#0a0a0a" /> : submitted ? <><MdCheckCircle /> Publicado!</> : "Publicar registro"}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTISTS TAB
═══════════════════════════════════════════════════════════ */
const EMPTY_ARTIST = { name: "", bio: "", photoUrl: "" };

function ArtistsTab({ onSuccess }) {
  const [form, setForm] = useState(EMPTY_ARTIST);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showMusicError("Nome artístico é obrigatório.");
    setLoading(true);
    try {
      await adminService.createArtist(form);
      showMusicSuccess(`Artista "${form.name}" criado!`);
      setForm(EMPTY_ARTIST); setOk(true); setTimeout(() => setOk(false), 3000); onSuccess?.();
    } catch (err) { showMusicError(err?.response?.data?.message || "Erro ao criar artista."); }
    finally { setLoading(false); }
  };

  return (
    <div className="admin-workspace">
      <EditorHeader title="Curadoria de artistas" desc="Monte perfis fortes, com bio, identidade visual e contexto para o catálogo." onNew={() => setForm(EMPTY_ARTIST)} />
      <div className="admin-editor-preview">
        <div className="admin-editor-card">
          <FormHeader onClear={() => setForm(EMPTY_ARTIST)} />
          <form onSubmit={submit} noValidate>
            <div className="admin-field">
              <label className="admin-label" htmlFor="a-name">Nome artístico <span className="admin-required">*</span></label>
              <input id="a-name" name="name" className="admin-input" placeholder="Ex.: Lua Norte" value={form.name} onChange={set} disabled={loading} autoComplete="off" />
            </div>
            <div className="admin-field">
              <label className="admin-label" htmlFor="a-bio">Bio</label>
              <textarea id="a-bio" name="bio" className="admin-input admin-textarea" placeholder="Contexto do artista, sonoridade e identidade." value={form.bio} onChange={set} disabled={loading} rows={4} />
            </div>
            <div className="admin-field">
              <label className="admin-label" htmlFor="a-photo">Foto URL</label>
              <input id="a-photo" name="photoUrl" className="admin-input" type="url" placeholder="https://..." value={form.photoUrl} onChange={set} disabled={loading} autoComplete="off" />
            </div>
            <UploadBtn label="Enviar imagem" type="image" onUploadSuccess={url => setForm(p => ({ ...p, photoUrl: url }))} />
            <PublishBtn isLoading={loading} submitted={ok} />
          </form>
        </div>
        <div className="admin-preview-card">
          <p className="admin-preview-kicker">PREVIEW</p>
          <h3 className="admin-preview-title">COMO ISSO SE APRESENTA</h3>
          <div className="admin-preview-artist">
            <div className="admin-preview-cover">
              {form.photoUrl ? <img src={form.photoUrl} alt="" /> : <FiUser />}
            </div>
            <div>
              <p className="admin-preview-sublabel">PREVIEW DO ARTISTA</p>
              <p className="admin-preview-name">{form.name || "NOVO ARTISTA"}</p>
              <p className="admin-preview-bio">{form.bio || "Uma bio bem escrita melhora a descoberta na home."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ALBUMS TAB
═══════════════════════════════════════════════════════════ */
const EMPTY_ALBUM = { title: "", artistId: "", releaseDate: "", coverUrl: "" };

function AlbumsTab({ artists, onSuccess }) {
  const [form, setForm] = useState(EMPTY_ALBUM);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const selectedArtist = artists.find(a => String(a.id) === String(form.artistId));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return showMusicError("Título do álbum é obrigatório.");
    setLoading(true);
    try {
      await adminService.createAlbum(form);
      showMusicSuccess(`Álbum "${form.title}" criado!`);
      setForm(EMPTY_ALBUM); setOk(true); setTimeout(() => setOk(false), 3000); onSuccess?.();
    } catch (err) { showMusicError(err?.response?.data?.message || "Erro ao criar álbum."); }
    finally { setLoading(false); }
  };

  return (
    <div className="admin-workspace">
      <EditorHeader title="Lançamentos e álbuns" desc="Organize capas, datas e relação entre álbum e artista como em um CMS de streaming." onNew={() => setForm(EMPTY_ALBUM)} />
      <div className="admin-editor-preview">
        <div className="admin-editor-card">
          <FormHeader onClear={() => setForm(EMPTY_ALBUM)} />
          <form onSubmit={submit} noValidate>
            <div className="admin-form-row">
              <div className="admin-field">
                <label className="admin-label" htmlFor="al-title">Título <span className="admin-required">*</span></label>
                <input id="al-title" name="title" className="admin-input" placeholder="Ex.: Noite em Fita" value={form.title} onChange={set} disabled={loading} autoComplete="off" />
              </div>
              <div className="admin-field">
                <label className="admin-label" htmlFor="al-artist">Artista</label>
                <select id="al-artist" name="artistId" className="admin-input admin-select" value={form.artistId} onChange={set} disabled={loading}>
                  <option value="">Selecione o artista</option>
                  {artists.map(a => <option key={a.id} value={a.id}>{a.nome || a.name || a.artisticName || "Artista Desconhecido"}</option>)}
                </select>
              </div>
            </div>
            <div className="admin-field">
              <label className="admin-label" htmlFor="al-date">Data de lançamento</label>
              <input id="al-date" name="releaseDate" className="admin-input" type="date" value={form.releaseDate} onChange={set} disabled={loading} />
            </div>
            <div className="admin-field">
              <label className="admin-label" htmlFor="al-cover">Capa URL</label>
              <input id="al-cover" name="coverUrl" className="admin-input" type="url" placeholder="https://..." value={form.coverUrl} onChange={set} disabled={loading} autoComplete="off" />
            </div>
            <UploadBtn label="Enviar capa" type="image" onUploadSuccess={url => setForm(p => ({ ...p, coverUrl: url }))} />
            <PublishBtn isLoading={loading} submitted={ok} />
          </form>
        </div>
        <div className="admin-preview-card">
          <p className="admin-preview-kicker">PREVIEW</p>
          <h3 className="admin-preview-title">COMO ISSO SE APRESENTA</h3>
          <div className="admin-preview-artist">
            <div className="admin-preview-cover admin-preview-cover--sq">
              {form.coverUrl ? <img src={form.coverUrl} alt="" /> : <FiDisc />}
            </div>
            <div>
              <p className="admin-preview-sublabel">PREVIEW DO ÁLBUM</p>
              <p className="admin-preview-name">{form.title || "NOVO ÁLBUM"}</p>
              <p className="admin-preview-bio">{selectedArtist ? `Por ${selectedArtist.name || selectedArtist.artisticName}` : "Defina um artista para posicionar o lançamento."}</p>
              {form.releaseDate && <p className="admin-preview-date">{new Date(form.releaseDate + "T12:00:00").toLocaleDateString("pt-BR")}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MUSICS TAB
═══════════════════════════════════════════════════════════ */
const EMPTY_MUSIC = { title: "", genre: "", albumId: "", artistId: "", featArtistIds: [], fileUrl: "", previewUrl: "", coverUrl: "", durationSeconds: null };

function MusicsTab({ artists, albums, genres, onSuccess }) {
  const [form, setForm] = useState(EMPTY_MUSIC);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [artistSearch, setArtistSearch] = useState("");
  const [featSearch, setFeatSearch] = useState("");
  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onFileUrlBlur = async () => {
    if (!form.fileUrl) return;
    setDetecting(true);
    const dur = await detectDuration(form.fileUrl);
    setForm(p => ({ ...p, durationSeconds: dur }));
    setDetecting(false);
  };

  const handleAudioUpload = async (url) => {
    setForm(p => ({ ...p, fileUrl: url, previewUrl: p.previewUrl || url }));
    setDetecting(true);
    const dur = await detectDuration(url);
    if (dur) {
       setForm(p => ({ ...p, durationSeconds: dur }));
    }
    setDetecting(false);
  };

  const toggleFeat = (id) => setForm(p => ({
    ...p,
    featArtistIds: p.featArtistIds.includes(id) ? p.featArtistIds.filter(x => x !== id) : [...p.featArtistIds, id]
  }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return showMusicError("Título é obrigatório.");
    if (!form.genre) return showMusicError("Selecione um gênero.");
    setLoading(true);
    try {
      await adminService.createMusic({ ...form, albumId: form.albumId || undefined, artistId: form.artistId || undefined, durationSeconds: form.durationSeconds || undefined, featArtistIds: form.featArtistIds.length ? form.featArtistIds : undefined });
      showMusicSuccess(`"${form.title}" adicionada ao catálogo!`);
      setForm(EMPTY_MUSIC); setOk(true); setTimeout(() => setOk(false), 3000); onSuccess?.();
    } catch (err) { showMusicError(err?.response?.data?.message || "Erro ao criar música."); }
    finally { setLoading(false); }
  };

  const fmt = (s) => s ? `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}` : null;

  return (
    <div className="admin-workspace">
      <EditorHeader title="Faixas e playback" desc="Controle áudio, preview, capa e metadados que alimentam a experiência do usuário." onNew={() => setForm(EMPTY_MUSIC)} />
      <div className="admin-editor-preview">
        <div className="admin-editor-card">
          <FormHeader onClear={() => setForm(EMPTY_MUSIC)} />
          <form onSubmit={submit} noValidate>
            <div className="admin-form-row">
              <div className="admin-field">
                <label className="admin-label" htmlFor="m-title">Título <span className="admin-required">*</span></label>
                <input id="m-title" name="title" className="admin-input" placeholder="Ex.: Rua 4:17" value={form.title} onChange={set} disabled={loading} autoComplete="off" />
              </div>
              <div className="admin-field">
                <label className="admin-label" htmlFor="m-genre">Gênero <span className="admin-required">*</span></label>
                <select id="m-genre" name="genre" className="admin-input admin-select" value={form.genre} onChange={set} disabled={loading}>
                  <option value="" disabled>Selecione</option>
                  {genres.map(g => {
                    const name = g.name || g;
                    return <option key={name} value={name}>{name}</option>;
                  })}
                </select>
              </div>
            </div>

            <div className="admin-field">
              <label className="admin-label">Duração detectada</label>
              <div className={`admin-duration${detecting ? " admin-duration--loading" : ""}`}>
                {detecting ? <><ButtonSpinner color="#e8b84b" /><span>Analisando áudio...</span></> :
                 form.durationSeconds ? <><MdAudiotrack /><span>{fmt(form.durationSeconds)} detectados</span></> :
                 <><span className="admin-duration-waiting">Aguardando áudio</span><span className="admin-duration-hint">Calculado ao informar a URL do arquivo abaixo.</span></>}
              </div>
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="m-album">Álbum</label>
              <select id="m-album" name="albumId" className="admin-input admin-select" value={form.albumId} onChange={set} disabled={loading}>
                <option value="">Sem álbum</option>
                {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>

            {artists.length > 0 && (
              <>
                <div className="admin-field">
                  <label className="admin-label">Artista principal</label>
                  <input type="text" className="admin-input admin-search-sm" placeholder="Buscar artista principal..." value={artistSearch} onChange={e => setArtistSearch(e.target.value)} style={{ marginBottom: "8px" }} />
                  <div className="admin-feat-grid">
                    {artists.filter(a => (a.nome || a.name || a.artisticName || "").toLowerCase().includes(artistSearch.toLowerCase())).map(a => {
                      const active = form.artistId === a.id;
                      return (
                        <button key={a.id} type="button" className={`admin-feat-card${active ? " admin-feat-card--active" : ""}`} onClick={() => setForm(p => ({ ...p, artistId: active ? "" : a.id }))}>
                          <span className="admin-feat-name">{a.nome || a.name || a.artisticName || "Artista Desconhecido"}</span>
                          <span className="admin-feat-action">{active ? "✓ principal" : "selecionar"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="admin-field">
                  <label className="admin-label">Artistas participantes (feat)</label>
                  <input type="text" className="admin-input admin-search-sm" placeholder="Buscar feats..." value={featSearch} onChange={e => setFeatSearch(e.target.value)} style={{ marginBottom: "8px" }} />
                  <div className="admin-feat-grid">
                    {artists.filter(a => (a.nome || a.name || a.artisticName || "").toLowerCase().includes(featSearch.toLowerCase())).map(a => {
                      const active = form.featArtistIds.includes(a.id);
                      return (
                        <button key={a.id} type="button" className={`admin-feat-card${active ? " admin-feat-card--active" : ""}`} onClick={() => toggleFeat(a.id)}>
                          <span className="admin-feat-name">{a.nome || a.name || a.artisticName || "Artista Desconhecido"}</span>
                          <span className="admin-feat-action">{active ? "✓ feat" : "adicionar feat"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="admin-field">
              <label className="admin-label" htmlFor="m-file">Arquivo URL</label>
              <input id="m-file" name="fileUrl" className="admin-input" type="url" placeholder="https://storage..." value={form.fileUrl} onChange={set} onBlur={onFileUrlBlur} disabled={loading} autoComplete="off" />
            </div>
            <div className="admin-field">
              <label className="admin-label" htmlFor="m-preview">Preview URL</label>
              <input id="m-preview" name="previewUrl" className="admin-input" type="url" placeholder="https://..." value={form.previewUrl} onChange={set} disabled={loading} autoComplete="off" />
            </div>
            <div className="admin-field">
              <label className="admin-label" htmlFor="m-cover">Capa URL</label>
              <input id="m-cover" name="coverUrl" className="admin-input" type="url" placeholder="https://..." value={form.coverUrl} onChange={set} disabled={loading} autoComplete="off" />
            </div>
            <div className="admin-upload-row">
              <UploadBtn label="Enviar áudio" type="audio" onUploadSuccess={handleAudioUpload} />
              <UploadBtn label="Enviar capa" type="image" onUploadSuccess={url => setForm(p => ({ ...p, coverUrl: url }))} />
            </div>
            <PublishBtn isLoading={loading} submitted={ok} />
          </form>
        </div>
        <div className="admin-preview-card">
          <p className="admin-preview-kicker">PREVIEW</p>
          <h3 className="admin-preview-title">COMO ISSO SE APRESENTA</h3>
          <div className="admin-preview-artist">
            <div className="admin-preview-cover admin-preview-cover--sq">
              {form.coverUrl ? <img src={form.coverUrl} alt="" /> : <FiMusic />}
            </div>
            <div>
              <p className="admin-preview-sublabel">PREVIEW DA FAIXA</p>
              <p className="admin-preview-name">{form.title || "NOVA MÚSICA"}</p>
              <p className="admin-preview-bio">{form.genre || "Gênero ainda não informado"}</p>
              {form.durationSeconds && <p className="admin-preview-date">{fmt(form.durationSeconds)}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PLAYLISTS TAB
═══════════════════════════════════════════════════════════ */
const EMPTY_PLAYLIST = { name: "", coverUrl: "", musicIds: [] };

function PlaylistsTab({ musics, musicsLoaded, onSuccess }) {
  const [form, setForm] = useState(EMPTY_PLAYLIST);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [search, setSearch] = useState("");

  const toggleMusic = (id) => setForm(p => ({
    ...p,
    musicIds: p.musicIds.includes(id) ? p.musicIds.filter(x => x !== id) : [...p.musicIds, id]
  }));

  // Resolve title/artist from multiple possible field names the backend may return
  const getMusicTitle  = (m) => m.title  || m.titulo  || m.name  || "";
  const getMusicArtist = (m) => m.artist || m.artista || (typeof m.artistName === "string" ? m.artistName : "") || "";

  const filtered = musics.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return getMusicTitle(m).toLowerCase().includes(q) || getMusicArtist(m).toLowerCase().includes(q);
  });

  // First 4 selected musics for 2x2 cover preview
  const first4Covers = form.musicIds
    .slice(0, 4)
    .map(id => musics.find(m => m.id === id))
    .filter(Boolean)
    .map(m => m.coverUrl || m.capaUrl || m.imageUrl || null);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showMusicError("Nome da playlist é obrigatório.");
    if (!form.musicIds.length) return showMusicError("Selecione ao menos uma música.");
    setLoading(true);
    try {
      await adminService.createPlaylist({ ...form, coverUrl: form.coverUrl || undefined });
      showMusicSuccess(`Playlist "${form.name}" criada para todos os usuários!`);
      setForm(EMPTY_PLAYLIST); setOk(true); setTimeout(() => setOk(false), 3000); onSuccess?.();
    } catch (err) { showMusicError(err?.response?.data?.message || "Erro ao criar playlist."); }
    finally { setLoading(false); }
  };

  return (
    <div className="admin-workspace">
      <EditorHeader title="Playlists públicas" desc="Crie playlists visíveis para todos os usuários do Deefy." onNew={() => setForm(EMPTY_PLAYLIST)} />
      <div className="admin-editor-preview">
        <div className="admin-editor-card">
          <FormHeader onClear={() => setForm(EMPTY_PLAYLIST)} />
          <form onSubmit={submit} noValidate>
            <div className="admin-field">
              <label className="admin-label" htmlFor="pl-name">Nome da Playlist <span className="admin-required">*</span></label>
              <input id="pl-name" name="name" className="admin-input" placeholder="Ex.: Noite Chill" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} disabled={loading} autoComplete="off" />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="pl-cover">Capa da Playlist <span className="admin-optional">(opcional)</span></label>
              <input id="pl-cover" name="coverUrl" className="admin-input" type="url" placeholder="https://... ou faça upload abaixo" value={form.coverUrl}
                onChange={e => setForm(p => ({ ...p, coverUrl: e.target.value }))} disabled={loading} autoComplete="off" />
              <UploadBtn label="Enviar capa" type="image" onUploadSuccess={url => setForm(p => ({ ...p, coverUrl: url }))} />
            </div>

            <div className="admin-field">
              <label className="admin-label">Selecionar músicas <span className="admin-required">*</span></label>
              <input className="admin-input" type="text" placeholder="Buscar músicas..." value={search} onChange={e => setSearch(e.target.value)} />
              <div className="admin-music-list">
                {filtered.length === 0 && (
                  <p className="admin-music-empty">
                    {!musicsLoaded
                      ? "Carregando músicas..."
                      : musics.length === 0
                        ? "Nenhuma música cadastrada no sistema ainda."
                        : "Nenhuma música encontrada para esta busca."}
                  </p>
                )}
                {filtered.map(m => {
                  const active = form.musicIds.includes(m.id);
                  return (
                    <button key={m.id} type="button" className={`admin-music-item${active ? " admin-music-item--active" : ""}`} onClick={() => toggleMusic(m.id)}>
                      <div className="admin-music-info">
                        <span className="admin-music-title">{getMusicTitle(m)}</span>
                        <span className="admin-music-artist">{getMusicArtist(m)}</span>
                      </div>
                      {active && <MdCheckCircle className="admin-music-check" />}
                    </button>
                  );
                })}
              </div>
              <p className="admin-music-selected">{form.musicIds.length} música(s) selecionada(s)</p>
            </div>

            <PublishBtn isLoading={loading} submitted={ok} />
          </form>
        </div>
        <div className="admin-preview-card">
          <p className="admin-preview-kicker">PREVIEW</p>
          <h3 className="admin-preview-title">COMO ISSO SE APRESENTA</h3>
          <div className="admin-preview-artist">
            <div className="admin-preview-cover admin-preview-cover--sq">
              {form.coverUrl ? (
                <img src={form.coverUrl} alt="" />
              ) : first4Covers.length >= 4 ? (
                <div className="admin-playlist-grid-cover">
                  {first4Covers.map((url, i) => (
                    <div key={i} className="admin-playlist-grid-cell">
                      {url ? <img src={url} alt="" /> : <FiMusic />}
                    </div>
                  ))}
                </div>
              ) : (
                <FiList />
              )}
            </div>
            <div>
              <p className="admin-preview-sublabel">PLAYLIST PÚBLICA</p>
              <p className="admin-preview-name">{form.name || "NOVA PLAYLIST"}</p>
              <p className="admin-preview-bio">{form.musicIds.length} faixa(s) • Visível para todos os usuários</p>
              {!form.coverUrl && first4Covers.length > 0 && first4Covers.length < 4 && (
                <p className="admin-preview-hint">Selecione {4 - first4Covers.length} música(s) para o grid 2×2</p>
              )}
            </div>
          </div>
          <div className="admin-preview-note">
            <strong>Lógica da branch</strong>
            <p>Playlists criadas aqui são públicas e aparecem na home para todos os usuários do Deefy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
/* ════════════════════════════════════════════════════════════
   GENRES TAB
════════════════════════════════════════════════════════════ */
function GenresTab({ genres, onSuccess }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return showMusicError("O nome do gênero é obrigatório.");
    setLoading(true);
    try {
      await adminService.createGenre({ name: name.trim() });
      showMusicSuccess(`Gênero "${name.trim()}" criado!`);
      setName(""); setOk(true); setTimeout(() => setOk(false), 3000); onSuccess?.();
    } catch (err) { showMusicError(err?.response?.data?.message || "Erro ao criar gênero."); }
    finally { setLoading(false); }
  };

  const handleDelete = async (genre) => {
    const id = genre.id;
    if (!id) return showMusicError("Este gênero não possui ID válido para exclusão.");
    setDeleting(id);
    try {
      await adminService.deleteGenre(id);
      showMusicSuccess(`Gênero "${genre.name}" removido.`);
      onSuccess?.();
    } catch (err) { showMusicError(err?.response?.data?.message || "Erro ao remover gênero."); }
    finally { setDeleting(null); }
  };

  return (
    <div className="admin-workspace">
      <EditorHeader
        title="Gestão de gêneros"
        desc="Gêneros criados aqui ficam disponíveis para selecionar ao cadastrar músicas."
        onNew={() => setName("")}
      />
      <div className="admin-editor-preview">
        <div className="admin-editor-card">
          <FormHeader onClear={() => setName("")} />
          <form onSubmit={submit} noValidate>
            <div className="admin-field">
              <label className="admin-label" htmlFor="g-name">
                Nome do Gênero <span className="admin-required">*</span>
              </label>
              <input
                id="g-name"
                className="admin-input"
                type="text"
                placeholder="Ex.: Bossa Nova, Trap, Drill..."
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
            </div>
            <PublishBtn isLoading={loading} submitted={ok} />
          </form>

          {/* Existing genres list */}
          {genres.length > 0 && (
            <>
              <p className="admin-genre-list-title">Gêneros cadastrados</p>
              <div className="admin-genre-list">
                {genres.map(g => (
                  <div key={g.id ?? g.name} className="admin-genre-pill">
                    <span>{g.name || g}</span>
                    {g.id && (
                      <button
                        type="button"
                        className="admin-genre-delete"
                        onClick={() => handleDelete(g)}
                        disabled={deleting === g.id}
                        aria-label={`Remover ${g.name}`}
                      >
                        {deleting === g.id ? <ButtonSpinner color="#f06060" /> : <MdDelete />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          {genres.length === 0 && (
            <p className="admin-genre-empty">Nenhum gênero cadastrado ainda. Crie o primeiro acima!</p>
          )}
        </div>

        <div className="admin-preview-card">
          <p className="admin-preview-kicker">PREVIEW</p>
          <h3 className="admin-preview-title">COMO ISSO SE APRESENTA</h3>
          <div className="admin-preview-artist">
            <div className="admin-preview-cover"><FiTag /></div>
            <div>
              <p className="admin-preview-sublabel">NOVO GÊNCERO</p>
              <p className="admin-preview-name">{name || "NOME DO GÊNCERO"}</p>
              <p className="admin-preview-bio">Aparecerá no select de gêneros ao criar uma nova música.</p>
            </div>
          </div>
          <div className="admin-preview-note">
            <strong>Lógica</strong>
            <p>Gêneros são compartilhados por todo o catálogo. Remover um gênero não altera as músicas já cadastradas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
