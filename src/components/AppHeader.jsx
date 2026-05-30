import { GitHubBadge } from './GitHubBadge';

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__left">
        <h1 className="app-header__title">Income Tax Calculator</h1>
        <GitHubBadge />
      </div>
      <p className="app-header__disclaimer">
        This may not be 100% accurate or certified. Always check official
        government policies and verify calculations.
      </p>
    </header>
  );
}
