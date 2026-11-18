package com.example.shopease.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.shopease.Filter.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity 
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter){
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
    
    @Bean 
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean 
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable()).formLogin(form -> form.disable()).httpBasic(basic -> basic.disable()).sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)).authorizeHttpRequests(auth -> auth
            .requestMatchers(
                "/",
                "/index.html",
                "/css/**",
                "/js/**",
                "/images/**",
                "/uploads/**",
                "/pages/**",
                "/admin/**",
                "/favicon.ico"
            ).permitAll()

            .requestMatchers(
                "/api/users/register",
                "/api/users/login"
            ).permitAll()
            
            .requestMatchers(HttpMethod.GET,
                "/api/products",
                "/api/products/**"
            ).permitAll()

            .requestMatchers(HttpMethod.GET,
                "/api/categories",
                "/api/categories/**"
            ).permitAll()

            .requestMatchers(HttpMethod.POST,
                "/api/categories/**"
            ).hasAuthority("ROLE_ADMIN")

            .requestMatchers(HttpMethod.PUT,
                "/api/categories/**"
            ).hasAuthority("ROLE_ADMIN")

            .requestMatchers(HttpMethod.DELETE,
                "/api/categories/**"
            ).hasAuthority("ROLE_ADMIN")

            .requestMatchers(HttpMethod.POST,
                "/api/products/**"
            ).hasAuthority("ROLE_ADMIN")

            .requestMatchers(HttpMethod.PUT,
                "/api/products/**"
            ).hasAuthority("ROLE_ADMIN")

            .requestMatchers(HttpMethod.DELETE,
                "/api/products/**"
            ).hasAuthority("ROLE_ADMIN")

            .requestMatchers(
                "/api/admin/**"
            ).hasAuthority("ROLE_ADMIN")

            .requestMatchers(
                "/api/orders/admin/**"
            ).hasAuthority("ROLE_ADMIN")

            .anyRequest().authenticated()
        ).addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
   return http.build();
    }

}
