package com.lucas.projedatacrud.controller;

import com.lucas.projedatacrud.model.ProductMaterial;
import com.lucas.projedatacrud.repository.ProductMaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/product-ingredients")
@CrossOrigin(origins = "*")
public class ProductMaterialController {

    @Autowired
    private ProductMaterialRepository repository;

    @PostMapping
    public ProductMaterial addIngredient(@RequestBody ProductMaterial association) {
        return repository.save(association);
    }
}