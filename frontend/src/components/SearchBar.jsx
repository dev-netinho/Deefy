import { useRef } from "react";
import { IoMdSearch, IoMdClose } from "react-icons/io";
import "./SearchBar.css";

/**
 * Controlled search bar component.
 *
 * @param {{ value: string, onChange: (v: string) => void }} props
 */
function SearchBar({ value, onChange }) {
  const inputRef = useRef(null);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className={`search-bar${value ? " search-bar--active" : ""}`}>
      <IoMdSearch className="search-bar-icon" aria-hidden="true" />
      <input
        ref={inputRef}
        id="home-search"
        type="search"
        autoComplete="off"
        spellCheck={false}
        placeholder="Pesquisar músicas, artistas, álbuns..."
        aria-label="Pesquisar músicas"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
