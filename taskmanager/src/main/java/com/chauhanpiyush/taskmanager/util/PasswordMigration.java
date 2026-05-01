package com.chauhanpiyush.taskmanager.util;

import com.chauhanpiyush.taskmanager.repository.UserRepository;
import com.chauhanpiyush.taskmanager.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PasswordMigration implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if migration is needed
        List<User> users = userRepository.findAll();
        boolean migrationNeeded = false;
        
        for (User user : users) {
            // If password doesn't start with $2$, it's not a bcrypt hash
            if (user.getPassword() != null && !user.getPassword().startsWith("$2$")) {
                migrationNeeded = true;
                break;
            }
        }
        
        if (migrationNeeded) {
            log.info("Starting password migration...");
            
            for (User user : users) {
                if (user.getPassword() != null && !user.getPassword().startsWith("$2$")) {
                    String plainPassword = user.getPassword();
                    String hashedPassword = PasswordUtil.hashPassword(plainPassword);
                    
                    user.setPassword(hashedPassword);
                    userRepository.save(user);
                    
                    log.info("Migrated password for user: {}", user.getEmail());
                }
            }
            
            log.info("Password migration completed successfully!");
        } else {
            log.info("Password migration not needed - passwords are already hashed.");
        }
    }
}
