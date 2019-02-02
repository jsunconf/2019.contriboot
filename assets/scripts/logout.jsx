import preact from 'preact';

export default ({ user, logout }) => (
  <div className='user'>
    <div className="user__message">
      Logged in as {user.username}
    </div>
    <button
        className='button button--small user__button-logout'
        type='button'
        onClick={logout}>
      Logout
    </button>
  </div>
)
