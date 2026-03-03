package com.lucas.projedatacrud.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "raw_materials")
@Data
public class RawMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer quantity;
}
