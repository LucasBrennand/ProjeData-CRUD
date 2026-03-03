package com.lucas.projedatacrud.repository;

import com.lucas.projedatacrud.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Integer> {
}
