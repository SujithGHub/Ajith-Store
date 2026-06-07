package com.ajith.store.domain.repository;

import com.ajith.store.domain.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
