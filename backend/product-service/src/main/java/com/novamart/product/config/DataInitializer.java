package com.novamart.product.config;

import com.novamart.product.model.Category;
import com.novamart.product.model.Product;
import com.novamart.product.repository.CategoryRepository;
import com.novamart.product.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Automatically seeds initial categories and products into the product database
 * on microservice startup.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public DataInitializer(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            return; // Already initialized
        }

        // 1. Seed Categories
        Category electronics = categoryRepository.save(new Category(null, "Electronics", "electronics", 
                "Latest gadgets, computing, and cutting-edge personal tech", 
                "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80"));
        Category audio = categoryRepository.save(new Category(null, "Audio & Sound", "audio", 
                "High-fidelity headphones, studio monitors, and wireless earbuds", 
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"));
        Category fashion = categoryRepository.save(new Category(null, "Fashion & Apparel", "fashion", 
                "Curated apparel, streetwear, and minimalist wardrobe essentials", 
                "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80"));
        Category footwear = categoryRepository.save(new Category(null, "Footwear", "footwear", 
                "Premium sneakers, runners, and everyday comfort footwear", 
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"));
        Category home = categoryRepository.save(new Category(null, "Home & Living", "home-living", 
                "Modern aesthetic decor, ambient lighting, and artisanal workspace items", 
                "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80"));

        // 2. Seed Realistic Catalog Products
        List<Product> products = new ArrayList<>();

        products.add(new Product(null, "AuraSound Pro Wireless ANC Headphones",
                "Studio-grade active noise cancellation with 40mm beryllium drivers, 38-hour battery life, spatial audio tracking, and ultra-soft memory foam earcups.",
                new BigDecimal("249.99"), new BigDecimal("329.99"), 24, 45, "AUD-PRO-01", audio,
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
                "AuraSound", 4.9, 128, true, LocalDateTime.now()));

        products.add(new Product(null, "UltraBook Zenith 15-inch M3 OLED Laptop",
                "Ultra-slim pro laptop notebook computer with aerospace aluminum unibody chassis, 120Hz 3K OLED Retina display, 32GB unified RAM, and lightning-fast 1TB NVMe PCIe 4.0 SSD storage.",
                new BigDecimal("1299.00"), new BigDecimal("1499.00"), 13, 18, "LAP-ZEN-15", electronics,
                "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
                "Zenith Tech", 4.8, 89, true, LocalDateTime.now()));

        products.add(new Product(null, "Nova Timepiece Titanium Minimalist Watch",
                "Swiss quartz precision movement encased in Grade-5 satin-brushed titanium with scratch-resistant sapphire crystal and waterproof silicone strap.",
                new BigDecimal("189.50"), new BigDecimal("240.00"), 21, 24, "WAT-NOV-09", fashion,
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
                "Nova Horology", 4.7, 64, true, LocalDateTime.now()));

        products.add(new Product(null, "Velocity CloudRunner Gen-4 Running Shoes",
                "High-performance running shoes and sneakers with zero-gravity nitrogen-infused foam midsole providing unprecedented energy return and all-day breathable flyknit upper.",
                new BigDecimal("135.00"), new BigDecimal("170.00"), 20, 32, "SHOE-VEL-4", footwear,
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80",
                "Velocity Sport", 4.9, 210, true, LocalDateTime.now()));

        products.add(new Product(null, "Lumina Smart Desk Ambient Light Bar",
                "Asymmetric optical design prevents screen glare, featuring auto-dimming touch sensors, circadian rhythm syncing, and 16M RGB backlight.",
                new BigDecimal("69.99"), new BigDecimal("89.99"), 22, 50, "LUM-DSK-01", home,
                "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
                null, "Lumina Studio", 4.6, 42, false, LocalDateTime.now()));

        products.add(new Product(null, "Horizon 4K Mirrorless Cinema Camera",
                "Full-frame 33MP sensor, 4K 120fps 10-bit recording, 5-axis IBIS, and dual UHS-II card slots for professional content creators.",
                new BigDecimal("1850.00"), new BigDecimal("2100.00"), 12, 8, "CAM-HOR-4K", electronics,
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
                null, "Horizon Optical", 4.9, 56, true, LocalDateTime.now()));

        products.add(new Product(null, "Minimalist Heavyweight French Terry Hoodie",
                "100% custom-milled organic cotton (450 GSM), drop-shoulder relaxed silhouette, double-layered hood without drawstrings for a clean contemporary drape.",
                new BigDecimal("85.00"), new BigDecimal("110.00"), 22, 4, "APP-HD-01", fashion,
                "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
                null, "Atelier Nova", 4.7, 98, false, LocalDateTime.now()));

        products.add(new Product(null, "PureFlow Smart Ceramic Pour-Over Kettle",
                "Precise 1-degree temperature control, gooseneck spout for optimal extraction flow rate, and built-in barista brew stopwatch timer.",
                new BigDecimal("119.00"), new BigDecimal("145.00"), 18, 3, "HOM-KET-02", home,
                "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
                null, "Kettle & Bean", 4.8, 77, false, LocalDateTime.now()));

        products.add(new Product(null, "Pulse Wireless Ergonomic Mechanical Keyboard",
                "Gasket-mounted hot-swappable switches, sound dampening brass plate, programmable OLED display knob, and tri-mode Bluetooth 5.2/2.4G/USB-C.",
                new BigDecimal("159.99"), new BigDecimal("199.99"), 20, 29, "KB-PUL-03", electronics,
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
                null, "Pulse Peripherals", 4.9, 143, true, LocalDateTime.now()));

        productRepository.saveAll(products);
    }
}
