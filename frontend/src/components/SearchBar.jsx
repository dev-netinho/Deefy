import { useRef } from "react";
import { IoMdSearch, IoMdClose } from "react-icons/io";
import "./SearchBar.css";

/**
 * Controlled search bar component.
 *
 * @param {{
 *   value: string,
 *   onChange: (v: string) => void,
 *   onFocus?: () => void,
 *   id?: string,
 *   placeholder?: string,
 *   ariaLabel?: string,
 *   className?: string
 * }} props
 */
function SearchBar({
  value,
  onChange,
  onFocus,
  id = "home-search",
  placeholder = "Pesquisar músicas, gêneros, álbuns, artistas e playlists...",
  ariaLabel = "Pesquisar no Deefy",
  className = "",
}) {
  const inputRef = useRef(null);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className={`search-bar${value ? " search-bar--active" : ""}${className ? ` ${className}` : ""}`}>
      <IoMdSearch className="search-bar-icon" aria-hidden="true" />
      <input
        ref={inputRef}
        id={id}
        type="search"
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        className="search-bar-input"
      />
      {value && (
        <button
          className="search-bar-clear"
          onClick={handleClear}
          aria-label="Limpar pesquisa"
          tabIndex={0}
        >
          <IoMdClose />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
