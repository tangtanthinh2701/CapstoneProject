package com.capston.project.back.end.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "partners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Partner {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(name = "partner_name", nullable = false, columnDefinition = "TEXT")
	private String partnerName;

	@Column(name = "img_url", length = 500)
	private String imgUrl;

	@OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	@Builder.Default
	private List<ProjectPartner> projectPartners = new ArrayList<>();
}
