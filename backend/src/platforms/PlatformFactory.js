import { SallaPlatform } from './SallaPlatform.js';
import { ZidPlatform } from './ZidPlatform.js';

export class PlatformFactory {
  /**
   * مصنع لإرجاع الكلاس المناسب للمنصة المطلوبة ديناميكياً
   * @param {string} platformName - اسم المنصة (salla أو zid)
   * @returns {BasePlatform} - كلاس المنصة
   */
  static getPlatform(platformName) {
    if (!platformName) {
      throw new Error('Platform name is required');
    }

    const name = platformName.toLowerCase();
    
    if (name === 'salla') {
      return new SallaPlatform();
    } else if (name === 'zid') {
      return new ZidPlatform();
    } else {
      throw new Error(`Platform '${platformName}' is not supported yet`);
    }
  }
}
