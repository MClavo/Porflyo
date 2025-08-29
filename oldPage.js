return (
    <div className="app-container">
      <div className="main-content">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Here's a quick overview of your account and portfolio activity.
          </p>
        </div>

        {/* User Card */}
        <div className="card mb-4">
          <div className="user-profile">
            {/* Avatar */}
            <div>
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={`${user.name} avatar`}
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar" style={{ background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', fontWeight: '500' }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="user-info">
              <h3>{user?.name || 'User'}</h3>
              {user?.description && (
                <p>{user.description}</p>
              )}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="repo-grid">
          <Link
            to="/app/portfolios"
            className="card hover:shadow-lg transition-all"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div style={{ width: '2.5rem', height: '2.5rem', background: 'var(--surface)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Manage Portfolios</h3>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Create, edit, and publish your portfolios. View analytics and manage your public presence.
            </p>
          </Link>

          <Link
            to="/profile"
            className="card hover:shadow-lg transition-all"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div style={{ width: '2.5rem', height: '2.5rem', background: 'var(--surface)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Edit Profile</h3>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Update your personal information, bio, social links, and profile picture.
            </p>
          </Link>

          <Link
            to="/dashboard"
            className="card hover:shadow-lg transition-all"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div style={{ width: '2.5rem', height: '2.5rem', background: 'var(--surface)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '1.25rem', height: '1.25rem', color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Full Dashboard</h3>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              View your complete dashboard with repositories, activity, and detailed analytics.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );