package br.com.deefy.model;

import jakarta.persistence.*;
// Entidade que representa os perfis de acesso
@Entity
@Table(name = "perfil")
public class Perfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false, unique = true, length = 100)
    private String nome; // Ex: "COMUM" ou "ADMIN"

    protected Perfil() {}

    public Perfil(String nome) {
        this.nome = nome;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
}