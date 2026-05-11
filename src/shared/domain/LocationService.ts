/**
 * Domain Service para cálculos geográficos.
 */
export class LocationService {
  /**
   * Calcula a distância entre dois pontos usando a fórmula de Haversine (em metros).
   */
  public static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distância em metros
  }

  /**
   * Verifica se uma coordenada está dentro do raio permitido de outra.
   */
  public static isWithinRadius(
    userLat: number,
    userLon: number,
    targetLat: number,
    targetLon: number,
    radiusInMeters: number,
    accuracy: number = 0
  ): boolean {
    const distance = this.calculateDistance(userLat, userLon, targetLat, targetLon);
    
    // Subtraímos a margem de erro do GPS (accuracy) da distância calculada
    // Se o GPS diz que estou a 100m com 50m de erro, posso estar a 50m (dentro) ou 150m (fora).
    // Sendo leniente: distância - erro <= raio
    const adjustedDistance = Math.max(0, distance - accuracy);
    
    return adjustedDistance <= radiusInMeters;
  }
}
