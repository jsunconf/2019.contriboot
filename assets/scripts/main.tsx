import React from 'react';
import ReactDOM from 'react-dom';

import firebase, { VOTES_DB, INTERESTS_DB, PROPOSALS_DB } from './config';

import Login from './login';
import Logout from './logout';
import EntriesList from './entries-list';
import AddEntriesForm from './add-entries-form';
import { ContribootEntry, ContribootUser, ContribootVote } from './types';
import { isObject } from 'util';
import { PROPOSALS, INTERESTS } from './static';

type DataSnapshot = firebase.database.DataSnapshot;

interface AppState {
  readonly shallScroll: boolean;
  readonly proposals: ContribootEntry[];
  readonly interests: ContribootEntry[];
  readonly votes: ContribootVote[];
  readonly user: null | ContribootUser;
  readonly currentEntryKey: null | string;
  readonly isSignedIn: boolean;
}

type FirebaseDataValueCallback = (a: firebase.database.DataSnapshot | null, b?: string) => any;

interface FirebaseCallbacks {
  votes: FirebaseDataValueCallback;
  interests: FirebaseDataValueCallback;
  proposals: FirebaseDataValueCallback;
}

class App extends React.Component<{}, AppState> {

  private firebaseCallbacks: Partial<FirebaseCallbacks> = {};

  constructor(props: any) {
    super(props);
    this.state = {
      shallScroll: true,
      proposals: [],
      interests: [],
      votes: [],
      user: null,
      currentEntryKey: null,
      isSignedIn: false
    };

    this.checkHash = this.checkHash.bind(this);
    this.setupFirebaseListeners = this.setupFirebaseListeners.bind(this);
    this.handleEntryAdd = this.handleEntryAdd.bind(this);
    this.doSetAuthenticatedUser = this.doSetAuthenticatedUser.bind(this);

    this.setupFirebaseListeners();
  }

  doSetAuthenticatedUser(firebaseUser: firebase.User) {
    const user = this.getUserData(firebaseUser);
    if (user) {
      this.setState({ user, isSignedIn: true })
    }
  }

  setupFirebaseListeners() {
    const getEntries = (snap: DataSnapshot): ContribootEntry[] => {
      const items: ContribootEntry[] = [];
      snap.forEach((itemSnap: DataSnapshot) => {
        const value = itemSnap.val();
        const item = { '.key': itemSnap.key };
        if (isObject(value)) {
          items.push({
            ...item,
            ...itemSnap.val()
          } );
        }
      });
      return items;
    };

    const getVotes = (snap: DataSnapshot): ContribootVote[] => {
      const items: ContribootVote[] = [];
      snap.forEach((itemSnap: DataSnapshot) => {
        const value = itemSnap.val();
        const item = { '.key': itemSnap.key };
        items.push({
          ...item,
          '.value': value
        });
      });
      return items;
    };

    this.firebaseCallbacks.proposals = firebase.database().ref(PROPOSALS_DB).on('value', (snap: DataSnapshot) => {
      this.setState({ proposals: getEntries(snap) });
    });

    this.firebaseCallbacks.interests = firebase.database().ref(INTERESTS_DB).on('value', (snap: DataSnapshot) => {
      this.setState({ interests: getEntries(snap) });
    });

    this.firebaseCallbacks.votes = firebase.database().ref(VOTES_DB).on('value', (snap: DataSnapshot) => {
      this.setState({ votes: getVotes(snap) });
    });
  }

  componentDidMount() {
    window.addEventListener('hashchange', this.checkHash, false);

    this.checkHash();
  }

  componentWillMount() {
    firebase
      .auth()
      .getRedirectResult()
      .then((result) => this.doSetAuthenticatedUser(result.user))
      .catch(function (error) {
        console.log('ERROR', error);
      });
  }

  componentDidUpdate() {
    const {
      interests,
      proposals,
      currentEntryKey,
      shallScroll
    } = this.state;

    const entriesCount = document.querySelectorAll('.entry').length;
    const didRender = proposals.length + interests.length === entriesCount;

    if (didRender && shallScroll && (proposals.length || interests.length)) {
      const currentElement = document.querySelector(
        `[data-key='${currentEntryKey}']`);

      if (currentElement) {
        this.setState({ shallScroll: false }, () => {
          currentElement.scrollIntoView();
        });
      }
    }
  }

  /**
   * Subscribe to hashchange
   */
  componentWillUnmount() {
    window.removeEventListener('hashchange', this.checkHash, false);

    firebase.database().ref(PROPOSALS_DB).off('value', this.firebaseCallbacks.proposals);
    firebase.database().ref(INTERESTS_DB).off('value', this.firebaseCallbacks.interests);
    firebase.database().ref(VOTES_DB).off('value', this.firebaseCallbacks.votes);
  }

  /**
   * When the hash changed
   */
  checkHash() {
    const currentEntryKey = location.hash.substr(1);

    this.setState({ currentEntryKey });
  }

  /**
   * Get the current user data
   * @param {Object} user The raw user data
   * @return {Object} The users data
   */
  getUserData(user: firebase.User): ContribootUser | null {
    if (!user) {
      return null;
    }

    return {
      id: user.uid,
      username: user.displayName,
      displayName: user.displayName,
      profileImageURL: user.photoURL
    };
  }

  /**
   * Add a new entry to the contributions
   * @param  {Object} newEntry The new entry
   */
  handleEntryAdd(newEntry: ContribootEntry) {
    const typeRef = firebase.database().ref(newEntry.type);
    const votesRef = firebase.database().ref(VOTES_DB);

    typeRef.push({
      title: newEntry.title,
      description: newEntry.description,
      user: this.state.user
    }).then(result => {
      const newKey = result.key;
      votesRef.child(newKey).set(1);
      window.location.hash = newKey;
    })

    this.setState({ shallScroll: true });
  }

  /**
   * Logout a user
   */
  logout() {
    const self = this;
    const logOutUser = function () {
      self.setState({ user: null });
    }

    firebase.auth().signOut().then(function () {
      logOutUser();
    }, function (error) {
      console.log('SIGN OUT ERROR', error);
    });
  }
  /**
   * Authenticate with Github
   */
  loginWithGithub() {
    firebase.auth().signInWithRedirect(new firebase.auth.GithubAuthProvider());
  }

  /**
   * Returns the component.
   * @return {React.Element}
   */
  render() {
    const isLoggedin = this.state.user !== null;
    const logoutForm = () => (<Logout user={this.state.user} logout={this.logout} />);
    const addEntryForm = () => (<AddEntriesForm onEntryAdd={this.handleEntryAdd} />);
    const loginForm = () => (<Login loginWithGithub={this.loginWithGithub} />);

    return (
      <div className='contriboot'>
        <div className='entries-container'>
          <EntriesList
            key={PROPOSALS}
            title='Talks Proposals'
            type={PROPOSALS}
            currentEntryKey={this.state.currentEntryKey}
            entries={this.state.proposals}
            votes={this.state.votes} />
          <EntriesList
            key={INTERESTS}
            title='Interests'
            type={INTERESTS}
            currentEntryKey={this.state.currentEntryKey}
            entries={this.state.interests}
            votes={this.state.votes} />
        </div>

        <h2>Add proposal or interest</h2>

        {
          isLoggedin
          ? [logoutForm(), addEntryForm()]
          : loginForm()
        }

      </div>
    );
  }
}

ReactDOM.hydrate(<App />, document.querySelector('.mount'));
