package com.lucas.projedatacrud.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "product_materials")
@Data
public class ProductMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "raw_material_id")
    private RawMaterial rawMaterial;

    @Column(nullable = false)
    private Integer requiredQuantity;
}