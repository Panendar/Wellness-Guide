/**
 * Frontend Component Test Suite
 * Tests all major components: loading states, error handling, user interactions, responsiveness
 * Created with Jest and React Testing Library
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock API service
jest.mock('../services/apiService', () => ({
  isAuthenticated: jest.fn(() => true),
  getStoredUser: jest.fn(() => ({ id: 1, email: 'test@example.com', full_name: 'Test User' })),
  getUserStats: jest.fn(),
  getSessionLogs: jest.fn(),
  getAllYogasanas: jest.fn(),
  getFavorites: jest.fn(),
  addFavorite: jest.fn(),
  removeFavorite: jest.fn(),
  checkFavorite: jest.fn(),
  getAchievements: jest.fn(),
  getDailyChallenge: jest.fn(),
  getSettings: jest.fn(),
  updateSettings: jest.fn(),
  getProgressData: jest.fn(),
}));

// Mock yogasana service
jest.mock('../services/yogasanaService', () => ({
  getAllYogasanas: jest.fn(() => [
    { id: 1, name: 'Downward Dog', difficulty: 'beginner', duration: 10, benefits: 'Stretches' },
    { id: 2, name: 'Warrior', difficulty: 'intermediate', duration: 15, benefits: 'Strength' },
  ]),
  getYogasanaById: jest.fn((id) => ({ id, name: 'Test Pose', duration: 10 })),
}));

// Mock achievement trigger service
jest.mock('../services/achievementTriggerService', () => ({
  addListener: jest.fn(),
  removeListener: jest.fn(),
  checkAchievements: jest.fn(),
  afterPracticeSession: jest.fn(),
  afterAddFavorite: jest.fn(),
  afterRemoveFavorite: jest.fn(),
}));

// Helper to render with Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
      <ToastContainer />
    </BrowserRouter>
  );
};

// ============================================================================
// DASHBOARD COMPONENT TESTS
// ============================================================================

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    const Dashboard = require('../components/Dashboard/Dashboard').default;
    const API = require('../services/apiService').default;
    API.getUserStats.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRouter(<Dashboard />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays error state with retry button', async () => {
    const Dashboard = require('../components/Dashboard/Dashboard').default;
    const API = require('../services/apiService').default;
    API.getUserStats.mockRejectedValueOnce(new Error('API Error'));

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument();
    });
    
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders stats cards after loading', async () => {
    const Dashboard = require('../components/Dashboard/Dashboard').default;
    const API = require('../services/apiService').default;
    API.getUserStats.mockResolvedValueOnce({
      total_sessions: 25,
      total_minutes: 500,
      current_streak: 7,
      average_session_length: 20
    });

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument(); // Total sessions
      expect(screen.getByText('500')).toBeInTheDocument(); // Total minutes
    });
  });

  it('displays quick action buttons', async () => {
    const Dashboard = require('../components/Dashboard/Dashboard').default;
    const API = require('../services/apiService').default;
    API.getUserStats.mockResolvedValueOnce({
      total_sessions: 10,
      total_minutes: 200,
      current_streak: 3,
      average_session_length: 20
    });

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /start practice/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view history/i })).toBeInTheDocument();
    });
  });

  it('handles empty state gracefully', async () => {
    const Dashboard = require('../components/Dashboard/Dashboard').default;
    const API = require('../services/apiService').default;
    API.getUserStats.mockResolvedValueOnce({
      total_sessions: 0,
      total_minutes: 0,
      current_streak: 0,
      average_session_length: 0
    });

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/no sessions yet/i)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// YOGASANA SEARCH COMPONENT TESTS
// ============================================================================

describe('YogasanaSearch Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input and filters', () => {
    const YogasanaSearch = require('../components/Search/YogasanaSearch').default;
    renderWithRouter(<YogasanaSearch />);

    expect(screen.getByPlaceholderText(/search yogasanas/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/difficulty/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
  });

  it('filters yogasanas in real-time', async () => {
    const YogasanaSearch = require('../components/Search/YogasanaSearch').default;
    renderWithRouter(<YogasanaSearch />);

    const searchInput = screen.getByPlaceholderText(/search yogasanas/i);
    await userEvent.type(searchInput, 'dog');

    await waitFor(() => {
      expect(screen.getByText('Downward Dog')).toBeInTheDocument();
    });
  });

  it('applies difficulty filter', async () => {
    const YogasanaSearch = require('../components/Search/YogasanaSearch').default;
    renderWithRouter(<YogasanaSearch />);

    const difficultySelect = screen.getByLabelText(/difficulty/i);
    await userEvent.selectOption(difficultySelect, 'beginner');

    await waitFor(() => {
      const results = screen.getAllByRole('article'); // Assuming cards are articles
      results.forEach((card) => {
        expect(card).toHaveTextContent('Beginner');
      });
    });
  });

  it('displays empty state when no results match filters', async () => {
    const YogasanaSearch = require('../components/Search/YogasanaSearch').default;
    renderWithRouter(<YogasanaSearch />);

    const searchInput = screen.getByPlaceholderText(/search yogasanas/i);
    await userEvent.type(searchInput, 'xyz123nonexistent');

    await waitFor(() => {
      expect(screen.getByText(/no yogasanas found/i)).toBeInTheDocument();
    });
  });

  it('clears filters when clear button clicked', async () => {
    const YogasanaSearch = require('../components/Search/YogasanaSearch').default;
    renderWithRouter(<YogasanaSearch />);

    const searchInput = screen.getByPlaceholderText(/search yogasanas/i);
    await userEvent.type(searchInput, 'dog');

    const clearButton = screen.getByRole('button', { name: /clear filters/i });
    await userEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
  });
});

// ============================================================================
// PRACTICE HISTORY COMPONENT TESTS
// ============================================================================

describe('PracticeHistory Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders history table with sessions', async () => {
    const PracticeHistory = require('../components/History/PracticeHistory').default;
    const API = require('../services/apiService').default;
    
    API.getSessionLogs.mockResolvedValueOnce({
      sessions: [
        { id: 1, duration_minutes: 30, yogasanas: ['Downward Dog'], created_at: '2026-01-30' },
        { id: 2, duration_minutes: 20, yogasanas: ['Warrior'], created_at: '2026-01-29' },
      ],
      total: 2
    });

    renderWithRouter(<PracticeHistory />);

    await waitFor(() => {
      expect(screen.getByText('Downward Dog')).toBeInTheDocument();
      expect(screen.getByText('Warrior')).toBeInTheDocument();
    });
  });

  it('handles empty history gracefully', async () => {
    const PracticeHistory = require('../components/History/PracticeHistory').default;
    const API = require('../services/apiService').default;
    API.getSessionLogs.mockResolvedValueOnce({ sessions: [], total: 0 });

    renderWithRouter(<PracticeHistory />);

    await waitFor(() => {
      expect(screen.getByText(/no practice sessions recorded/i)).toBeInTheDocument();
    });
  });

  it('implements pagination correctly', async () => {
    const PracticeHistory = require('../components/History/PracticeHistory').default;
    const API = require('../services/apiService').default;
    
    API.getSessionLogs.mockResolvedValueOnce({
      sessions: Array(10).fill({ id: 1, duration_minutes: 30, yogasanas: ['Pose'], created_at: '2026-01-30' }),
      total: 20
    });

    renderWithRouter(<PracticeHistory />);

    await waitFor(() => {
      expect(screen.getByText(/page 1/i)).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton);

    expect(API.getSessionLogs).toHaveBeenCalledWith(expect.objectContaining({ skip: 10 }));
  });

  it('filters sessions by date range', async () => {
    const PracticeHistory = require('../components/History/PracticeHistory').default;
    renderWithRouter(<PracticeHistory />);

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    await userEvent.type(startDateInput, '2026-01-01');
    await userEvent.type(endDateInput, '2026-01-31');

    const filterButton = screen.getByRole('button', { name: /filter/i });
    await userEvent.click(filterButton);

    expect(screen.getByText('Filtering sessions...')).toBeInTheDocument();
  });
});

// ============================================================================
// FAVORITES COMPONENT TESTS
// ============================================================================

describe('Favorites Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays user favorites with pagination', async () => {
    const Favorites = require('../components/Favorites/Favorites').default;
    const API = require('../services/apiService').default;
    
    API.getFavorites.mockResolvedValueOnce([
      { id: 1, name: 'Downward Dog', added_date: '2026-01-20' },
      { id: 2, name: 'Warrior', added_date: '2026-01-25' },
    ]);

    renderWithRouter(<Favorites />);

    await waitFor(() => {
      expect(screen.getByText('Downward Dog')).toBeInTheDocument();
      expect(screen.getByText('Warrior')).toBeInTheDocument();
    });
  });

  it('shows empty state when no favorites', async () => {
    const Favorites = require('../components/Favorites/Favorites').default;
    const API = require('../services/apiService').default;
    API.getFavorites.mockResolvedValueOnce([]);

    renderWithRouter(<Favorites />);

    await waitFor(() => {
      expect(screen.getByText(/no favorites yet/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /browse yogasanas/i })).toBeInTheDocument();
    });
  });

  it('removes favorite when unfavorited', async () => {
    const Favorites = require('../components/Favorites/Favorites').default;
    const API = require('../services/apiService').default;
    
    API.getFavorites.mockResolvedValueOnce([
      { id: 1, name: 'Downward Dog', added_date: '2026-01-20' },
    ]);
    API.removeFavorite.mockResolvedValueOnce({});

    renderWithRouter(<Favorites />);

    await waitFor(() => {
      expect(screen.getByText('Downward Dog')).toBeInTheDocument();
    });

    const unfavoriteButton = screen.getByRole('button', { name: /remove from favorites/i });
    await userEvent.click(unfavoriteButton);

    await waitFor(() => {
      expect(API.removeFavorite).toHaveBeenCalledWith(1);
    });
  });
});

// ============================================================================
// YOGASANA CARD COMPONENT TESTS
// ============================================================================

describe('YogasanaCard Component', () => {
  const mockYogasana = {
    id: 1,
    name: 'Downward Dog',
    difficulty: 'beginner',
    duration: 10,
    benefits: 'Stretches back and hamstrings',
    image_Url: '/images/downward-dog.jpg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders yogasana card with details', () => {
    const YogasanaCard = require('../components/shared/YogasanaCard').default;
    render(<YogasanaCard yogasana={mockYogasana} />);

    expect(screen.getByText('Downward Dog')).toBeInTheDocument();
    expect(screen.getByText(/beginner/i)).toBeInTheDocument();
    expect(screen.getByText(/10 min/i)).toBeInTheDocument();
  });

  it('displays favorite button', () => {
    const YogasanaCard = require('../components/shared/YogasanaCard').default;
    const API = require('../services/apiService').default;
    API.checkFavorite.mockResolvedValueOnce({ is_favorite: false });

    render(<YogasanaCard yogasana={mockYogasana} />);

    expect(screen.getByRole('button', { name: /favorite/i })).toBeInTheDocument();
  });

  it('toggles favorite status on click', async () => {
    const YogasanaCard = require('../components/shared/YogasanaCard').default;
    const API = require('../services/apiService').default;
    API.checkFavorite.mockResolvedValueOnce({ is_favorite: false });
    API.addFavorite.mockResolvedValueOnce({});

    render(<YogasanaCard yogasana={mockYogasana} />);

    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    await userEvent.click(favoriteButton);

    await waitFor(() => {
      expect(API.addFavorite).toHaveBeenCalledWith(1, 'Downward Dog');
    });
  });

  it('shows favorited heart when already favorited', async () => {
    const YogasanaCard = require('../components/shared/YogasanaCard').default;
    const API = require('../services/apiService').default;
    API.checkFavorite.mockResolvedValueOnce({ is_favorite: true });

    render(<YogasanaCard yogasana={mockYogasana} />);

    await waitFor(() => {
      const heartButton = screen.getByRole('button', { name: /favorite/i });
      expect(heartButton).toHaveClass('favorited');
    });
  });
});

// ============================================================================
// PROGRESS TRACKER COMPONENT TESTS
// ============================================================================

describe('ProgressTracker Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders three tabs: overview, charts, sessions', async () => {
    const ProgressTracker = require('../components/Analytics/ProgressTracker').default;
    const API = require('../services/apiService').default;
    
    API.getUserStats.mockResolvedValueOnce({ total_sessions: 10, current_streak: 5 });
    API.getSessionLogs.mockResolvedValueOnce([]);

    renderWithRouter(<ProgressTracker />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /charts/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /sessions/i })).toBeInTheDocument();
    });
  });

  it('displays metric cards in overview tab', async () => {
    const ProgressTracker = require('../components/Analytics/ProgressTracker').default;
    const API = require('../services/apiService').default;
    
    API.getUserStats.mockResolvedValueOnce({
      total_sessions: 25,
      current_streak: 7,
      total_minutes: 500,
      average_session_length: 20
    });
    API.getSessionLogs.mockResolvedValueOnce([]);

    renderWithRouter(<ProgressTracker />);

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument(); // sessions
      expect(screen.getByText('7')).toBeInTheDocument();  // streak
      expect(screen.getByText('500')).toBeInTheDocument(); // minutes
    });
  });

  it('renders charts in charts tab', async () => {
    const ProgressTracker = require('../components/Analytics/ProgressTracker').default;
    const API = require('../services/apiService').default;
    
    API.getUserStats.mockResolvedValueOnce({ total_sessions: 10, current_streak: 5 });
    API.getSessionLogs.mockResolvedValueOnce([
      { id: 1, duration_minutes: 30, yogasanas: ['Pose1'], created_at: '2026-01-30' },
    ]);

    renderWithRouter(<ProgressTracker />);

    const chartsTab = await screen.findByRole('tab', { name: /charts/i });
    await userEvent.click(chartsTab);

    await waitFor(() => {
      expect(screen.getByText(/practice trend/i)).toBeInTheDocument();
    });
  });

  it('filters data by time range', async () => {
    const ProgressTracker = require('../components/Analytics/ProgressTracker').default;
    const API = require('../services/apiService').default;
    
    API.getUserStats.mockResolvedValueOnce({ total_sessions: 10, current_streak: 5 });
    API.getSessionLogs.mockResolvedValueOnce([]);

    renderWithRouter(<ProgressTracker />);

    const monthButton = await screen.findByRole('button', { name: /last 30 days/i });
    await userEvent.click(monthButton);

    await waitFor(() => {
      expect(monthButton).toHaveClass('active');
    });
  });
});

// ============================================================================
// SETTINGS COMPONENT TESTS
// ============================================================================

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders settings form with toggles and inputs', async () => {
    const Settings = require('../components/Settings/Settings').default;
    const API = require('../services/apiService').default;
    
    API.getSettings.mockResolvedValueOnce({
      notifications_enabled: true,
      daily_reminder_time: '07:00',
      theme: 'light'
    });

    renderWithRouter(<Settings />);

    await waitFor(() => {
      expect(screen.getByLabelText(/notifications/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/reminder time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    });
  });

  it('toggles notification setting', async () => {
    const Settings = require('../components/Settings/Settings').default;
    const API = require('../services/apiService').default;
    
    API.getSettings.mockResolvedValueOnce({ notifications_enabled: true, daily_reminder_time: '07:00', theme: 'light' });
    API.updateSettings.mockResolvedValueOnce({});

    renderWithRouter(<Settings />);

    const notificationToggle = await screen.findByRole('checkbox', { name: /notifications/i });
    await userEvent.click(notificationToggle);

    await waitFor(() => {
      expect(API.updateSettings).toHaveBeenCalledWith(expect.objectContaining({
        notifications_enabled: false
      }));
    });
  });

  it('updates time picker value', async () => {
    const Settings = require('../components/Settings/Settings').default;
    const API = require('../services/apiService').default;
    
    API.getSettings.mockResolvedValueOnce({ notifications_enabled: true, daily_reminder_time: '07:00', theme: 'light' });
    API.updateSettings.mockResolvedValueOnce({});

    renderWithRouter(<Settings />);

    const timeInput = await screen.findByLabelText(/reminder time/i);
    await userEvent.type(timeInput, '09:00');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(API.updateSettings).toHaveBeenCalled();
    });
  });

  it('displays success message after saving', async () => {
    const Settings = require('../components/Settings/Settings').default;
    const API = require('../services/apiService').default;
    
    API.getSettings.mockResolvedValueOnce({ notifications_enabled: true, daily_reminder_time: '07:00', theme: 'light' });
    API.updateSettings.mockResolvedValueOnce({});

    renderWithRouter(<Settings />);

    const saveButton = await screen.findByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/settings saved successfully/i)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// RESPONSIVE DESIGN TESTS
// ============================================================================

describe('Responsive Design', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stacks components vertically on mobile', () => {
    // Mock window.matchMedia for mobile viewport
    global.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(max-width: 768px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const Dashboard = require('../components/Dashboard/Dashboard').default;
    const API = require('../services/apiService').default;
    API.getUserStats.mockResolvedValueOnce({
      total_sessions: 10,
      total_minutes: 200,
      current_streak: 3,
      average_session_length: 20
    });

    renderWithRouter(<Dashboard />);

    const metricsContainer = screen.getByTestId('metrics-grid');
    expect(metricsContainer).toHaveClass('mobile');
  });

  it('hides menu on mobile and shows hamburger', () => {
    global.innerWidth = 500;
    global.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(max-width: 768px)',
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const Navigation = require('../components/shared/Navigation').default;
    renderWithRouter(<Navigation />);

    const hamburger = screen.getByRole('button', { name: /menu/i });
    expect(hamburger).toBeInTheDocument();
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('completes a full practice flow', async () => {
    const API = require('../services/apiService').default;
    const PracticeSession = require('../components/Practice/PracticeSession').default;
    
    API.getUserStats.mockResolvedValueOnce({ total_sessions: 1 });

    renderWithRouter(<PracticeSession />);

    // Assume component loads and shows a pose
    await waitFor(() => {
      expect(screen.getByText(/pose 1 of/i)).toBeInTheDocument();
    });
  });

  it('navigates between pages using navigation', async () => {
    const Navigation = require('../components/shared/Navigation').default;
    renderWithRouter(<Navigation />);

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    const analyticsLink = screen.getByRole('link', { name: /analytics/i });

    expect(dashboardLink).toBeInTheDocument();
    expect(analyticsLink).toBeInTheDocument();

    await userEvent.click(analyticsLink);
    expect(analyticsLink.parentElement).toHaveClass('active');
  });
});
