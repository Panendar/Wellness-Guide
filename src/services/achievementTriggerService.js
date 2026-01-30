import API from './apiService';

/**
 * Achievement Trigger Service
 * Automatically checks for new achievements after user actions
 */

class AchievementTriggerService {
  constructor() {
    this.listeners = [];
    this.recentChecks = new Set();
  }

  /**
   * Add a listener for achievement unlocks
   * @param {Function} callback - Function to call when achievements are unlocked
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove a listener
   * @param {Function} callback - Listener to remove
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  /**
   * Notify all listeners about new achievements
   * @param {Array} achievements - Array of newly unlocked achievements
   */
  notifyListeners(achievements) {
    this.listeners.forEach(callback => {
      try {
        callback(achievements);
      } catch (error) {
        console.error('Error in achievement listener:', error);
      }
    });
  }

  /**
   * Check for new achievements with debouncing
   * @param {string} triggeredBy - Context that triggered the check
   * @returns {Promise<Array>} - Array of newly unlocked achievements
   */
  async checkAchievements(triggeredBy = 'manual') {
    // Debounce: don't check too frequently
    const checkKey = `${triggeredBy}-${Date.now()}`;
    if (this.recentChecks.has(triggeredBy)) {
      console.log(`Skipping duplicate achievement check for: ${triggeredBy}`);
      return [];
    }

    this.recentChecks.add(triggeredBy);
    setTimeout(() => this.recentChecks.delete(triggeredBy), 2000);

    try {
      console.log(`Checking achievements triggered by: ${triggeredBy}`);
      
      // Fetch all achievements to check progress
      const allAchievements = await API.getAchievements();
      
      // Filter achievements that are completed but not yet in user_achievements
      const newUnlocks = allAchievements.filter(achievement => {
        // If progress is 100% and not already unlocked
        return achievement.progress === 100 && !achievement.unlocked_at;
      });

      if (newUnlocks.length > 0) {
        console.log(`🎉 ${newUnlocks.length} new achievement(s) unlocked!`, newUnlocks);
        this.notifyListeners(newUnlocks);
      }

      return newUnlocks;
    } catch (error) {
      console.error('Failed to check achievements:', error);
      return [];
    }
  }

  /**
   * Trigger after completing a practice session
   * @param {Object} sessionData - Session data (duration, yogasanas, etc.)
   */
  async afterPracticeSession(sessionData) {
    console.log('Triggering achievement check after practice session');
    return await this.checkAchievements('practice-session');
  }

  /**
   * Trigger after adding a favorite
   * @param {Object} yogasanaData - Yogasana that was favorited
   */
  async afterAddFavorite(yogasanaData) {
    console.log('Triggering achievement check after adding favorite');
    return await this.checkAchievements('add-favorite');
  }

  /**
   * Trigger after removing a favorite
   */
  async afterRemoveFavorite() {
    console.log('Triggering achievement check after removing favorite');
    return await this.checkAchievements('remove-favorite');
  }

  /**
   * Trigger after completing a daily challenge
   * @param {Object} challengeData - Challenge completion data
   */
  async afterDailyChallenge(challengeData) {
    console.log('Triggering achievement check after daily challenge');
    return await this.checkAchievements('daily-challenge');
  }

  /**
   * Trigger after updating user settings
   */
  async afterSettingsUpdate() {
    console.log('Triggering achievement check after settings update');
    return await this.checkAchievements('settings-update');
  }

  /**
   * Trigger after creating a routine
   */
  async afterCreateRoutine() {
    console.log('Triggering achievement check after creating routine');
    return await this.checkAchievements('create-routine');
  }

  /**
   * Manual check (can be called by user action or periodic refresh)
   */
  async manualCheck() {
    console.log('Manual achievement check requested');
    return await this.checkAchievements('manual');
  }
}

// Export singleton instance
const achievementTrigger = new AchievementTriggerService();
export default achievementTrigger;
