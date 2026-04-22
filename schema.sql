-- VOZSEGURA — Schema v2
CREATE DATABASE IF NOT EXISTS vozsegura CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vozsegura;

CREATE TABLE IF NOT EXISTS usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  apellido      VARCHAR(100),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  telefono      VARCHAR(30),
  rol           ENUM('usuario','admin') DEFAULT 'usuario',
  activo        BOOLEAN DEFAULT TRUE,
  creado_en     DATETIME DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS solicitudes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  tipo        VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  urgencia    ENUM('baja','media','alta') DEFAULT 'media',
  estado      ENUM('pendiente','en_proceso','resuelta') DEFAULT 'pendiente',
  creado_en   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SELECT '✅ VozSegura schema creado' AS mensaje;
