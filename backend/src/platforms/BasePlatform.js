export class BasePlatform {
  /**
   * توليد رابط المصادقة المخصص للمنصة
   * @returns {Promise<{authUrl: string, state: string}>}
   */
  async generateAuthUrl() {
    throw new Error('Method generateAuthUrl must be implemented');
  }

  /**
   * مقايضة الكود المؤقت بالتوكنات الحقيقية
   * @param {string} code
   * @returns {Promise<object>}
   */
  async exchangeCodeForTokens(code) {
    throw new Error('Method exchangeCodeForTokens must be implemented');
  }

  /**
   * تجديد التوكن باستخدام الـ refresh token
   * @param {string} refreshToken
   * @returns {Promise<object>}
   */
  async refreshToken(refreshToken) {
    throw new Error('Method refreshToken must be implemented');
  }

  /**
   * تطبيع وتوحيد بنية التوكنات بين المنصات المختلفة
   * يُعيد { accessToken, refreshToken, managerToken, expiresAt }
   * @param {object} rawTokens - التوكنات الخام من الـ API
   * @returns {{ accessToken: string|null, refreshToken: string|null, managerToken: string|null, expiresAt: Date }}
   */
  normalizeTokens(rawTokens) {
    throw new Error('Method normalizeTokens must be implemented');
  }

  /**
   * جلب ملف تعريف المستخدم والمتجر الموحد
   * @param {string} accessToken
   * @param {string} managerToken
   * @returns {Promise<{user: object, store: object}>}
   */
  async fetchProfile(accessToken, managerToken) {
    throw new Error('Method fetchProfile must be implemented');
  }

  /**
   * جلب بيانات المتجر الحية مباشرة من الـ API
   * @param {string} accessToken
   * @param {string} managerToken
   * @returns {Promise<object>}
   */
  async fetchStoreProfile(accessToken, managerToken) {
    throw new Error('Method fetchStoreProfile must be implemented');
  }

  /**
   * جلب المنتجات حية ومباشرة من الـ API للمنصة
   * @param {string} accessToken
   * @param {string} managerToken
   * @param {object} queryParams
   * @returns {Promise<Array>}
   */
  async fetchProducts(accessToken, managerToken, queryParams) {
    throw new Error('Method fetchProducts must be implemented');
  }

  /**
   * جلب الأقسام حية ومباشرة من الـ API للمنصة
   * @param {string} accessToken
   * @param {string} managerToken
   * @param {object} queryParams
   * @returns {Promise<Array>}
   */
  async fetchCategories(accessToken, managerToken, queryParams) {
    throw new Error('Method fetchCategories must be implemented');
  }
}
