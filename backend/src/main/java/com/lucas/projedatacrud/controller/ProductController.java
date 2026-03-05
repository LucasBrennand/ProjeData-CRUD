package com.lucas.projedatacrud.controller;

import com.lucas.projedatacrud.model.Product;
import com.lucas.projedatacrud.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository repository;

    @GetMapping
    public List<Product> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Product create(@RequestBody Product product) {
        return repository.save(product);
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable Integer id, @RequestBody Product productDetails) {
        Product product = repository.findById(id).orElseThrow();
        product.setName(productDetails.getName());
        product.setPrice(productDetails.getPrice());
        product.setQuantity(productDetails.getQuantity());
        return repository.save(product);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        System.out.println("Deletando produto ID: " + id);
        repository.deleteById(id);
    }
}
