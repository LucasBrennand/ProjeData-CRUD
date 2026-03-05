# Projedata CRUD - The Ultimate Developer's Guide

Welcome to the ultimate, exhaustive, line-by-line breakdown of the **Projedata CRUD** application. This document is designed to act as a permanent study guide. It dissects every folder, every file, every class, every function, and every annotation in the entire full-stack project.

If you ever forget how a specific part of Spring Boot or React works, come back to this document.

---

## 📑 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Backend Deep Dive (Spring Boot)](#2-backend-deep-dive-spring-boot)
   - [Configuration](#21-configuration)
   - [Domain Model Layer (Entities)](#22-domain-model-layer-entities)
   - [Data Transfer Objects (DTOs)](#23-data-transfer-objects-dtos)
   - [Repository Layer](#24-repository-layer)
   - [Service Layer (Business Logic)](#25-service-layer-business-logic)
   - [Controller Layer (REST APIs)](#26-controller-layer-rest-apis)
3. [Frontend Deep Dive (React + Vite)](#3-frontend-deep-dive-react--vite)
   - [Entry Points & Config](#31-entry-points--config)
   - [Types & Services](#32-types--services)
   - [The Orchestrator: App.tsx](#33-the-orchestrator-apptsx)
   - [Common Components](#34-common-components)
   - [Dashboard Components](#35-dashboard-components)
   - [Modal Components](#36-modal-components)
4. [Core Workflows Explained](#4-core-workflows-explained)

---

## 1. Architecture Overview
This is a **Client-Server Architecture**:
*   **The Backend (Server):** Written in Java 17 using **Spring Boot 3**. It runs on port `8080`. It connects to a **PostgreSQL** database on port `5432` to store and retrieve data. It exposes RESTful APIs (endpoints that return JSON).
*   **The Frontend (Client):** Written in **React 19** using **TypeScript** and bundled with **Vite**. It runs on port `5173`. It makes HTTP requests to the backend using **Axios**, interprets the JSON data, and renders HTML/CSS using **Tailwind CSS 4**.

---

## 2. Backend Deep Dive (Spring Boot)
**Path:** `backend/src/main/java/com/lucas/projedatacrud/`

### 2.1 Configuration
**Path:** `backend/src/main/resources/application.properties`

```properties
spring.application.name=Projedata CRUD

# Database Connection
spring.datasource.url=jdbc:postgresql://localhost:5432/projedata_db
spring.datasource.username=postgres
spring.datasource.password=admin

# Hibernate (ORM) Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```
*   `spring.datasource.*`: Tells Spring Boot how to connect to PostgreSQL. It uses JDBC (Java Database Connectivity).
*   `spring.jpa.hibernate.ddl-auto=update`: This is magic. When the application starts, Hibernate (the ORM tool) looks at your Java classes (`@Entity`). If the corresponding tables don't exist in PostgreSQL, it creates them. If you add a new field to a class, it runs an `ALTER TABLE` query to add the column.
*   `spring.jpa.show-sql=true` & `format_sql=true`: Prints the generated SQL queries to your terminal console so you can see exactly what the database is doing behind the scenes.

---

### 2.2 Domain Model Layer (Entities)
Located in the `model/` package. This layer translates Java Objects into Database Tables.

#### File: `RawMaterial.java`
```java
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
```
*   `@Entity`: From Jakarta Persistence API (JPA). It marks this class as a database table.
*   `@Table(name = "raw_materials")`: Overrides the default naming. Without this, the table would be named `raw_material`. We force it to be plural.
*   `@Data`: A Lombok annotation. Lombok is a plugin that writes boilerplate code for you. During compilation, it silently adds `getId()`, `setId()`, `getName()`, `setName()`, `toString()`, `hashCode()`, and `equals()`. You never have to write them manually.
*   `@Id`: Marks the `id` field as the Primary Key (PK).
*   `@GeneratedValue(strategy = GenerationType.IDENTITY)`: Tells Postgres to use `SERIAL` or auto-incrementing IDs. The database decides the next ID, not Java.
*   `@Column(nullable = false)`: Translates to `NOT NULL` in SQL. If someone tries to save a RawMaterial without a name or quantity, the database will throw an error.

#### File: `Product.java`
```java
package com.lucas.projedatacrud.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import java.util.List;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer quantity = 0;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @ToString.Exclude
    private List<ProductMaterial> materials;
}
```
*   `@Column(nullable = false, columnDefinition = "integer default 0")`: Sets a strict SQL definition. If not provided, it defaults to 0 in both Java and SQL.
*   `@OneToMany`: The most complex part. A `Product` (like a Car) requires many `ProductMaterial` rows (4 Wheels, 1 Engine, etc).
*   `mappedBy = "product"`: Tells Hibernate, "I am not the boss of this relationship. Look at the `product` field inside the `ProductMaterial` class to find the actual foreign key."
*   `cascade = CascadeType.ALL`: If you call `repository.delete(product)`, Hibernate will automatically execute `DELETE FROM product_materials WHERE product_id = X` before deleting the product itself.
*   `fetch = FetchType.EAGER`: Every time you run `SELECT * FROM products`, Hibernate will immediately run another `SELECT` to grab all the ingredients. (The alternative is `LAZY`, which only fetches them when you explicitly call `product.getMaterials()`).
*   `orphanRemoval = true`: If you remove an ingredient from the `materials` Java List, Hibernate will physically delete that row from the database.
*   `@ToString.Exclude`: Prevents Lombok from printing the `materials` list. If a Product prints its Materials, and a Material prints its Product, they loop infinitely until the server crashes with a `StackOverflowError`.

#### File: `ProductMaterial.java`
```java
package com.lucas.projedatacrud.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "product_materials")
@Data
public class ProductMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "raw_material_id")
    private RawMaterial rawMaterial;

    @Column(nullable = false)
    private Integer requiredQuantity;
}
```
*   This is the "Join Table". Because it has extra data (`requiredQuantity`), we can't use a simple `@ManyToMany` annotation. We have to create a physical entity for it.
*   `@ManyToOne`: Many instances of this recipe item can point to one `Product`, and many can point to one `RawMaterial`.
*   `@JoinColumn(name = "product_id")`: Creates the actual Foreign Key column in the database.
*   `@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)`: A Jackson annotation (the library that converts Java to JSON). When receiving JSON from React (WRITE), it allows setting the `product`. But when sending JSON to React (READ), it completely hides the `product` field to prevent a circular JSON loop.

---

### 2.3 Data Transfer Objects (DTOs)
Located in the `dto/` package.
DTOs are simplified objects. We use them when we want to send specific data to the frontend without sending an entire database Entity.

#### File: `ProductionSuggestionDTO.java`
```java
package com.lucas.projedatacrud.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductionSuggestionDTO {
    private String productName;
    private Integer quantityToProduce;
    private Double totalValue;
}
```
*   `@AllArgsConstructor`: Tells Lombok to create a constructor that takes all fields: `public ProductionSuggestionDTO(String p, Integer q, Double t) {...}`.
*   This class is never saved to the database. It is only created in the Service layer, converted to JSON, and sent to React to display the "Production Insights" cards.

---

### 2.4 Repository Layer
Located in the `repository/` package.
These interfaces handle all database communication.

#### File: `ProductRepository.java` (Example)
```java
package com.lucas.projedatacrud.repository;

import com.lucas.projedatacrud.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
}
```
*   `@Repository`: Tells Spring this is a data access component.
*   `extends JpaRepository<Entity, TypeOfId>`: You don't have to write SQL! Spring Data JPA automatically generates classes in memory at runtime that implement this interface, providing you with methods like `save()`, `findAll()`, `findById()`, and `deleteById()`.

---

### 2.5 Service Layer (Business Logic)
Located in the `service/` package. The "Brain" of the backend.

#### File: `ProductionService.java`
```java
package com.lucas.projedatacrud.service;

import com.lucas.projedatacrud.dto.ProductionSuggestionDTO;
import com.lucas.projedatacrud.model.*;
import com.lucas.projedatacrud.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ProductionService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RawMaterialRepository rawMaterialRepository;
    // ...
```
*   `@Service`: Registers this as a Spring Bean containing business logic.
*   `@Autowired`: "Dependency Injection". Spring automatically creates instances of the repositories and plugs them into these variables so you can use them.

##### Method: `calculateSuggestedProduction()`
**Goal:** Look at all products, look at current stock, and figure out how many of each product can be built.

```java
    public List<ProductionSuggestionDTO> calculateSuggestedProduction() {
        // 1. Fetch all products, sorted by highest price first.
        List<Product> products = productRepository.findAll(Sort.by(Sort.Direction.DESC, "price"));

        // 2. Create a "Virtual Stock" copy of our inventory.
        Map<Integer, Integer> virtualStock = new HashMap<>();
        rawMaterialRepository.findAll().forEach(rm -> {
            virtualStock.put(rm.getId(), rm.getQuantity());
        });

        List<ProductionSuggestionDTO> suggestions = new ArrayList<>();

        // 3. Loop through every single product
        for (Product product : products) {
            // Skip products that have no recipe
            if (product.getMaterials() == null || product.getMaterials().isEmpty()) {
                continue;
            }

            int possibleToProduce = Integer.MAX_VALUE;

            // 4. Look at each ingredient for this product
            for (ProductMaterial pm : product.getMaterials()) {
                Integer stockAvailable = virtualStock.get(pm.getRawMaterial().getId());

                // If an ingredient is entirely missing, we can make 0.
                if (stockAvailable == null || stockAvailable <= 0) {
                    possibleToProduce = 0;
                    break;
                }

                // Integer division: e.g., 10 available / 3 required = 3 possible.
                int canMake = stockAvailable / pm.getRequiredQuantity();
                // We are bottlenecked by the ingredient with the lowest possible yield.
                possibleToProduce = Math.min(possibleToProduce, canMake);
            }

            // 5. If we can make at least 1
            if (possibleToProduce > 0 && possibleToProduce != Integer.MAX_VALUE) {
                // Deduct the ingredients from our "virtual stock" so we don't double-count 
                // them when calculating suggestions for the NEXT product in the loop.
                for (ProductMaterial pm : product.getMaterials()) {
                    int currentQty = virtualStock.get(pm.getRawMaterial().getId());
                    virtualStock.put(pm.getRawMaterial().getId(), currentQty - (possibleToProduce * pm.getRequiredQuantity()));
                }

                // Add the result to the list being sent to the frontend
                suggestions.add(new ProductionSuggestionDTO(
                        product.getName(),
                        possibleToProduce,
                        possibleToProduce * product.getPrice()
                ));
            }
        }
        return suggestions;
    }
```

##### Method: `executeProduction(Integer productId)`
**Goal:** Actually build a product, consume the raw materials, and increase product stock.
```java
    @Transactional
    public Product executeProduction(Integer productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getMaterials() == null || product.getMaterials().isEmpty()) {
            throw new RuntimeException("Cannot produce: No recipe defined");
        }

        // 1. Validate stock BEFORE consuming anything.
        for (ProductMaterial pm : product.getMaterials()) {
            RawMaterial rm = pm.getRawMaterial();
            if (rm.getQuantity() < pm.getRequiredQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + rm.getName());
            }
        }

        // 2. Consume materials.
        for (ProductMaterial pm : product.getMaterials()) {
            RawMaterial rm = pm.getRawMaterial();
            rm.setQuantity(rm.getQuantity() - pm.getRequiredQuantity());
            rawMaterialRepository.save(rm); // Updates database
        }

        // 3. Increment product quantity
        product.setQuantity(product.getQuantity() + 1);
        return productRepository.save(product); // Updates database
    }
```
*   **`@Transactional`**: The most critical annotation here. Database transactions are "all or nothing". Imagine step 2 fails halfway through because of a server crash. Without `@Transactional`, half of your materials would be deleted, but no product would be created! With `@Transactional`, if an error is thrown anywhere in this method, Spring intercepts it and shouts "ROLLBACK!" to the database, undoing every `.save()` operation that happened inside the method.

---

### 2.6 Controller Layer (REST APIs)
Located in the `controller/` package.

#### File: `ProductController.java`
```java
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
    
    // ... update and delete methods
}
```
*   `@RestController`: Tells Spring this class handles HTTP requests and will write the return values directly to the HTTP response body as JSON.
*   `@RequestMapping("/api/products")`: All endpoints in this file start with `http://localhost:8080/api/products`.
*   `@CrossOrigin(origins = "*")`: Bypasses browser security (CORS). Browsers usually block a frontend on `localhost:5173` from talking to a backend on `localhost:8080`. This tells the browser "It's okay, allow the request."
*   `@GetMapping` / `@PostMapping`: Maps HTTP GET and POST requests to these Java methods.
*   `@RequestBody`: Tells Spring to look at the body of the incoming HTTP POST request, take the JSON string, and automatically convert it into a Java `Product` object.

---

## 3. Frontend Deep Dive (React + Vite)
**Path:** `frontend/src/`

### 3.1 Entry Points & Config

*   **`index.html`**: The single HTML file sent to the browser. It contains `<div id="root"></div>`.
*   **`main.tsx`**: The React bootstrapper. It grabs the `div#root` and injects the entire `<App />` component into it using `createRoot()`.
*   **`index.css`**: Contains `@import "tailwindcss";`. This tells Tailwind CSS 4 to scan all your `.tsx` files, find classes like `bg-blue-500`, generate the CSS for them, and inject it here.

### 3.2 Types & Services

#### File: `types/index.ts`
```typescript
export interface RawMaterial {
  id?: number;
  name: string;
  quantity: number;
}
// ... Product, ProductionSuggestion interfaces
```
*   TypeScript Interfaces. These are contracts. By strictly typing our data, our code editor will yell at us if we try to type `material.amount` instead of `material.quantity`. This eliminates 90% of runtime undefined errors.

#### File: `services/api.ts`
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export default api;
```
*   Creates a global Axios instance. Now throughout the app, instead of writing `axios.get('http://localhost:8080/api/products')`, we just write `api.get('/products')`.

---

### 3.3 The Orchestrator: `App.tsx`
`App.tsx` holds the global state and coordinates everything. It is massive, so let's break it down by logic blocks.

#### State Management
```tsx
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<ProductionSuggestion[]>([]);
  
  const [isMatModalOpen, setIsMatModalOpen] = useState(false);
  // ... other modals
```
*   `useState`: When these variables change (using their `set` function), React destroys the old UI and redraws the screen with the new data.

#### Data Fetching
```tsx
  const fetchData = useCallback(async () => {
    try {
      const [resMat, resProd, resSug] = await Promise.all([
        api.get<RawMaterial[]>('/raw-materials'),
        api.get<Product[]>('/products'),
        api.get<ProductionSuggestion[]>('/production/suggested')
      ]);
      setMaterials(resMat.data);
      setProducts(resProd.data);
      setSuggestions(resSug.data);
      // ...
    } catch (error) { console.error(error); }
  }, [selectedProduct]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
```
*   `Promise.all`: A massive performance boost. Instead of waiting for Materials, THEN waiting for Products, it sends all 3 HTTP requests to the backend at the exact same time, resolving when all are finished.
*   `useCallback`: Memorizes the `fetchData` function so it isn't recreated on every render.
*   `useEffect`: Runs a function at a specific point in the component's lifecycle. Passing `[fetchData]` in the dependency array means: "Run this the first time the app loads."

#### App Render Layout
```tsx
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30 text-gray-900 font-sans overflow-x-hidden">
      <Header />
      {/* ... Error Toast ... */}
      <main className="flex-grow p-4 sm:p-6 lg:p-12 space-y-12 w-full max-w-7xl mx-auto">
        <ProductionInsights suggestions={suggestions} />
        <div className="w-full">
           <RawMaterials {/* props */} />
        </div>
        <ProductList {/* props */} />
      </main>
      
      {/* Hidden Modals floating outside the main flow */}
      <NewProductModal />
      <MaterialModal />
      <ProductDetailModal />

      <Footer />
    </div>
  );
```
*   `min-h-screen flex flex-col`: This is the secret to a perfect footer layout. The whole screen is a flex column.
*   `<main className="flex-grow">`: The main content acts as a spring, expanding to take up all available space.
*   `<Footer />`: Because the main content pushes down, the footer is perfectly pinned to the bottom of the content, without needing fixed positioning!

---

### 3.4 Common Components
**Path:** `components/Common/`

#### File: `Modal.tsx`
```tsx
export const Modal = ({ isOpen, onClose, title, children }: Props) => {
  if (!isOpen) return null; // Doesn't render anything if closed.

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* The background dim overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* The actual modal box */}
      <div className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden border border-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100/50 flex justify-between items-center bg-white/50">
          <h3 className="text-xl font-black text-gray-800 tracking-tighter">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 hover:rotate-90 transition-all p-2 rounded-xl hover:bg-red-50">✖</button>
        </div>
        {/* Dynamic content injected here */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};
```
*   `fixed inset-0 z-50`: Unsticks the div from the normal layout flow, pinning it over the entire screen (`top:0, right:0, bottom:0, left:0`) and placing it on top (`z-50`).
*   `{children}`: This is a powerful React concept. `Modal` doesn't care what goes inside it. It just provides the box, the background blur, and the close button. `App.tsx` passes forms inside it.

#### File: `Footer.tsx`
```tsx
const date = new Date();
const currentYear = date.getFullYear();

function Footer() {
  return (
    <footer className="w-full bg-gray-700 py-4 text-center text-white shadow shadow-black">
      <p>Made by Lucas Brennand &copy; {currentYear}</p>
    </footer>
  );
}
export default Footer;
```
*   Evaluates the `currentYear` dynamically so the copyright never goes out of date. Note how it no longer has `fixed bottom-0`, fixing the overlapping issue we had earlier.

---

### 3.5 Dashboard Components

#### File: `components/Dashboard/Insights/ProductionInsights.tsx`
```tsx
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {suggestions.map((s, i) => (
          <div key={i} className="...">
             {/* ... */}
          </div>
        ))}
      </div>
```
*   `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`: Tailwind responsiveness. 1 column on mobile, 2 on tablets, 3 on large screens.
*   `.map()`: The standard React way to render lists. It takes the array of data from the backend and loops through it, returning a chunk of JSX (HTML) for each item.

#### File: `components/Dashboard/Products/ProductCard.tsx`
*   Features an `absolute top-3 right-3 group-hover:opacity-100 opacity-0` delete button. This is CSS trickery: The button is invisible (`opacity-0`). But because the parent wrapper has the `group` class, when you hover over the parent, the child button activates `group-hover:opacity-100` and fades in!

---

### 3.6 Modal Components (The "Zero" Input Trick)
Let's look at a critical UX fix we applied to inputs.

#### File: `components/Modals/MaterialModal.tsx`
```tsx
        <input
          type="number"
          placeholder="Stock"
          className="w-full border p-4 rounded-2xl bg-white/50"
          required
          value={newMaterial.quantity || ""}
          onChange={(e) =>
            setNewMaterial({ ...newMaterial, quantity: Number(e.target.value) })
          }
        />
```
*   **The Problem:** `newMaterial.quantity` initializes at `0` (because it's a number). If React binds `value={0}`, the input field physically displays a "0". If the user wants to type "50", they have to click, press backspace to delete the "0", and then type "50".
*   **The Fix:** `value={newMaterial.quantity || ""}`. The logical OR `||` evaluates falsy values. Since `0` is technically a "falsy" value in JavaScript, if the state is 0, the equation resolves to `""` (an empty string). React binds the empty string, the input field is blank, the `placeholder="Stock"` appears, and the user can just click and type "50".
*   **The Event Handler:** `onChange` captures every keystroke. It spreads the existing state `...newMaterial` (keeping the name), and overwrites the `quantity` with `Number(e.target.value)`.

#### File: `components/Modals/NewProductModal.tsx`
This form is uniquely complex. It doesn't just save a product; it saves a *recipe*.
```tsx
  const [tempIngredients, setTempIngredients] = useState<TempIngredient[]>([]);
```
*   When a user selects a Raw Material from the dropdown and types a quantity, clicking "Add" does **not** call the API.
*   Instead, it pushes an object into `tempIngredients` and renders a list below the inputs.
*   Only when the user clicks the final Submit button on the form, `handleSubmit` is called. It passes the `newProduct` (Name, Price) AND the `tempIngredients` array back up to `App.tsx` via the `onSave` prop.
*   `App.tsx` then performs the complex orchestration of sending the POST requests to create the product, waiting for the ID, and then mapping through the temp array to send the recipe POST requests.

---

## 4. Core Workflows Explained

### Workflow: Deleting a Raw Material
1. User clicks the Trash icon on a Material row in `RawMaterialsList.tsx`.
2. Triggers `handleDelete(id)`.
3. `window.confirm` pops up to prevent accidental deletion.
4. Axios makes `api.delete('/raw-materials/{id}')`.
5. Spring Boot `RawMaterialController` receives `DELETE`.
6. `RawMaterialRepository` executes `DELETE FROM raw_materials WHERE id = X`.
   *(Note: If a `ProductMaterial` recipe currently uses this RawMaterial, the Postgres database will throw a Foreign Key Constraint Violation, and Spring Boot will return a 500 error. The React frontend catches this in the `catch` block and alerts the user).*
7. If successful, `onRefresh()` (which is just `fetchData()`) runs, updating the React UI.

### Workflow: Producing a Product
1. User clicks "Produce" on a Product Card.
2. `App.tsx` calls `handleProduceProduct(product)`.
3. Axios sends `POST /api/production/produce/5`.
4. Spring Boot `ProductionController` intercepts and routes to `ProductionService.executeProduction(5)`.
5. The method enters an `@Transactional` database lock.
6. It loops over the `materials` attached to Product 5. It checks if the `virtualStock` is sufficient.
7. If yes, it issues `UPDATE raw_materials SET quantity = quantity - required ...`.
8. It issues `UPDATE products SET quantity = quantity + 1 ...`.
9. The transaction finishes and the lock is released.
10. `fetchData()` is triggered in React, recalculating all Production Insights and updating stock numbers in real-time.

---
*End of documentation. Happy coding!*
