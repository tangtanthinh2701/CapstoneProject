package com.capston.project.back.end.config;

import com.capston.project.back.end.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
	private final JwtAuthenticationFilter jwtAuthFilter;
	private final UserDetailsService userDetailsService;

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.csrf(AbstractHttpConfigurer::disable)
				.authorizeHttpRequests(auth -> auth
						// ==================== PUBLIC ENDPOINTS ====================
						.requestMatchers("/api/auth/**", "/error").permitAll()
						.requestMatchers("/ws/**", "/topic/**", "/queue/**", "/app/**").permitAll()

						// ==================== ADMIN ONLY ENDPOINTS ====================
						// Admin Management
						.requestMatchers("/api/admin/**").hasRole("ADMIN")

						// User Management (Admin)
						.requestMatchers(HttpMethod.POST, "/api/users").hasRole("ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/users/*/role").hasRole("ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/users/*/status").hasRole("ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/users/*").hasRole("ADMIN")

						// Farm Management (Admin & Farmer CRUD)
						.requestMatchers(HttpMethod.POST, "/api/farms").hasAnyRole("ADMIN", "FARMER")
						.requestMatchers(HttpMethod.POST, "/api/farms/**").hasAnyRole("ADMIN", "FARMER")
						.requestMatchers(HttpMethod.PUT, "/api/farms/**").hasAnyRole("ADMIN", "FARMER")
						.requestMatchers(HttpMethod.DELETE, "/api/farms/**").hasAnyRole("ADMIN", "FARMER")

						// Tree Species Management (Admin CRUD)
						.requestMatchers(HttpMethod.POST, "/api/tree-species").hasRole("ADMIN")
						.requestMatchers(HttpMethod.POST, "/api/tree-species/**").hasRole("ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/tree-species/**").hasRole("ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/tree-species/**").hasRole("ADMIN")

						// Tree Batch Management (Admin & Farmer CRUD)
						.requestMatchers(HttpMethod.POST, "/api/tree-batches").hasAnyRole("ADMIN", "FARMER")
						.requestMatchers(HttpMethod.POST, "/api/tree-batches/**").hasAnyRole("ADMIN", "FARMER")
						.requestMatchers(HttpMethod.PUT, "/api/tree-batches/**").hasAnyRole("ADMIN", "FARMER")
						.requestMatchers(HttpMethod.DELETE, "/api/tree-batches/**").hasAnyRole("ADMIN", "FARMER")

						// Tree Growth Record Management (Admin & Farmer CRUD)
						.requestMatchers(HttpMethod.POST, "/api/tree-growth-records").hasAnyRole("ADMIN", "FARMER")
						.requestMatchers(HttpMethod.POST, "/api/tree-growth-records/**").hasAnyRole("ADMIN", "FARMER")
						.requestMatchers(HttpMethod.PUT, "/api/tree-growth-records/**").hasAnyRole("ADMIN", "FARMER")
						.requestMatchers(HttpMethod.DELETE, "/api/tree-growth-records/**").hasAnyRole("ADMIN", "FARMER")
						.requestMatchers(HttpMethod.GET, "/api/tree-growth-records/unhealthy")
						.hasAnyRole("ADMIN", "FARMER")

						// Project Management (Admin & User CRUD)
						.requestMatchers(HttpMethod.POST, "/api/projects/create-projects").hasAnyRole("ADMIN", "USER")
						.requestMatchers(HttpMethod.POST, "/api/projects/**").hasAnyRole("ADMIN", "USER")
						.requestMatchers(HttpMethod.PUT, "/api/projects/**").hasAnyRole("ADMIN", "USER")
						.requestMatchers(HttpMethod.DELETE, "/api/projects/**").hasAnyRole("ADMIN", "USER")
						.requestMatchers(HttpMethod.POST, "/api/projects/*/phases").hasAnyRole("ADMIN", "USER")
						.requestMatchers(HttpMethod.PUT, "/api/projects/*/phases/*").hasAnyRole("ADMIN", "USER")
						.requestMatchers(HttpMethod.DELETE, "/api/projects/*/phases/*").hasAnyRole("ADMIN", "USER")
						.requestMatchers(HttpMethod.POST, "/api/projects/*/recalculate").hasAnyRole("ADMIN", "USER")
						.requestMatchers(HttpMethod.POST, "/api/projects/recalculate-all").hasRole("ADMIN")

						// Contract Workflow (Admin approval)
						.requestMatchers(HttpMethod.POST, "/api/contracts/*/approve").hasRole("ADMIN")
						.requestMatchers(HttpMethod.POST, "/api/contracts/*/reject").hasRole("ADMIN")
						.requestMatchers(HttpMethod.POST, "/api/contracts/*/terminate").hasRole("ADMIN")
						.requestMatchers(HttpMethod.POST, "/api/contracts/*/activate").hasRole("ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/contracts/**").hasRole("ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/contracts/**").hasRole("ADMIN")

						// Contract Renewal (Admin approval)
						.requestMatchers(HttpMethod.POST, "/api/contracts/renewals/*/approve").hasRole("ADMIN")
						.requestMatchers(HttpMethod.POST, "/api/contracts/renewals/*/reject").hasRole("ADMIN")

						// Contract Transfer (Admin approval)
						.requestMatchers(HttpMethod.GET, "/api/contract-transfers").hasRole("ADMIN")
						.requestMatchers(HttpMethod.GET, "/api/contract-transfers/pending").hasRole("ADMIN")
						.requestMatchers(HttpMethod.POST, "/api/contract-transfers/*/approve").hasRole("ADMIN")
						.requestMatchers(HttpMethod.POST, "/api/contract-transfers/*/reject").hasRole("ADMIN")

						// Carbon Credit Management (Admin)
						.requestMatchers(HttpMethod.POST, "/api/carbon-credits").hasRole("ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/carbon-credits/**").hasRole("ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/carbon-credits/**").hasRole("ADMIN")
						.requestMatchers(HttpMethod.POST, "/api/carbon-credits/*/verify").hasRole("ADMIN")
						.requestMatchers(HttpMethod.POST, "/api/carbon-credits/*/allocate").hasRole("ADMIN")

						// Payment Management (Admin)
						.requestMatchers(HttpMethod.POST, "/api/payments/*/confirm").hasRole("ADMIN")
						.requestMatchers(HttpMethod.POST, "/api/payments/*/refund").hasRole("ADMIN")
						.requestMatchers(HttpMethod.GET, "/api/payments/all").hasRole("ADMIN")

						// Dashboard & Reports (Admin)
						.requestMatchers("/api/dashboard/admin/**").hasRole("ADMIN")
						.requestMatchers("/api/reports/**").hasRole("ADMIN")

						// ==================== USER ENDPOINTS (Authenticated) ====================
						// User can read public projects
						.requestMatchers(HttpMethod.GET, "/api/projects/public/**").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/projects/**").authenticated()

						// User can read farms, species, batches, growth records
						.requestMatchers(HttpMethod.GET, "/api/farms/**").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/tree-species/**").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/tree-batches/**").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/tree-growth-records/**").authenticated()

						// User profile endpoints
						.requestMatchers("/api/user/**").authenticated()

						// User can create contracts and request renewals
						.requestMatchers(HttpMethod.POST, "/api/contracts").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/contracts/*/submit").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/contracts/renewals").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/contracts/**").authenticated()

						// User can create transfer requests and view their transfers
						.requestMatchers(HttpMethod.POST, "/api/contract-transfers").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/contract-transfers/*/cancel").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/contract-transfers/*").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/contract-transfers/contract/**").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/contract-transfers/my-transfers").authenticated()

						// User can view and purchase carbon credits
						.requestMatchers(HttpMethod.GET, "/api/carbon-credits/**").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/carbon-credits/purchase").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/carbon-credits/retire").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/carbon-credits/allocations/*/claim").authenticated()

						// User payments
						.requestMatchers(HttpMethod.GET, "/api/payments/my-payments").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/payments/vnpay/**").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/payments/vnpay/**").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/payments/vnpay-return").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/payments/vnpay-ipn").permitAll()

						// User dashboard
						.requestMatchers("/api/dashboard/**").authenticated()

						// Chatbot
						.requestMatchers("/api/chatbot/**").authenticated()

						// Notifications
						.requestMatchers("/api/notifications/**").authenticated()

						// All other authenticated requests
						.anyRequest().authenticated())
				.sessionManagement(session -> session
						.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authenticationProvider(authenticationProvider())
				.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public AuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
		authProvider.setPasswordEncoder(passwordEncoder());
		return authProvider;
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
		return config.getAuthenticationManager();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(List.of("http://localhost:5173"));
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
		config.setAllowCredentials(true);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);

		return source;
	}
}
