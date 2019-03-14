import React from 'react';
import { ContribootUser } from './types';

export default ({ user, logout }: { user: ContribootUser, logout: () => void }): JSX.Element => (
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
