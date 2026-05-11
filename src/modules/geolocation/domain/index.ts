/**
 * Geolocation Domain — Bounded Context: Geolocalização
 *
 * Responsável por:
 * - Captura GPS (lat, lng, precisão)
 * - Validação anti-spoofing
 * - Validação distância empresa
 * - Detecção GPS inválido/impreciso
 *
 * Value Objects: GeoCoordinates, GPSAccuracy
 *
 * Eventos:
 * - GPSValidationFailed
 * - FraudDetected
 */

export {};
