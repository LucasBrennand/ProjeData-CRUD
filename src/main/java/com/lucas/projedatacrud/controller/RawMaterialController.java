package com.lucas.projedatacrud.controller;

import com.lucas.projedatacrud.model.RawMaterial;
import com.lucas.projedatacrud.repository.RawMaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/raw-materials")
@CrossOrigin(origins = "*")
public class RawMaterialController {

    @Autowired
    private RawMaterialRepository repository;

    @GetMapping
    public List<RawMaterial> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public RawMaterial create(@RequestBody RawMaterial material) {
        return repository.save(material);
    }

    @PutMapping("/{id}")
    public RawMaterial update(@PathVariable Integer id, @RequestBody RawMaterial materialDetails) {
        RawMaterial material = repository.findById(id).orElseThrow();
        material.setName(materialDetails.getName());
        material.setQuantity(materialDetails.getQuantity());
        return repository.save(material);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repository.deleteById(id);
    }
}