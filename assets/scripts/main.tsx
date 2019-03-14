import React from 'react';
import ReactDOM from 'react-dom';

import firebase, { VOTES_DB, INTERESTS_DB, CONTRIBUTIONS_DB } from './config';

import Login from './login';
import Logout from './logout';
import EntriesList from './entries-list';
import AddEntriesForm from './add-entries-form';
import { ContribootEntry, ContribootUser, GitHubUserProfile } from './types';

interface AppState {
  readonly shallScroll: boolean;
  readonly contributions: ContribootEntry[];
  readonly interests: any[];
  readonly votes: any[];
  readonly user: null | ContribootUser;
  readonly currentEntryKey: null | string; 
  readonly isSignedIn: boolean;
}

type FirebaseDataValueCallback = (a: firebase.database.DataSnapshot | null, b?: string) => any;

interface FirebaseCallbacks {
  votes: FirebaseDataValueCallback;
  interests: FirebaseDataValueCallback;
  contributions: FirebaseDataValueCallback;
}

class App extends React.Component<{}, AppState> {

  private firebaseCallbacks: Partial<FirebaseCallbacks> = {};

  constructor(props: any) {
    super(props);
    this.state = {
      shallScroll: true,
      contributions: [],
      interests: [],
      votes: [],
      user: null,
      currentEntryKey: null,
      isSignedIn: false
    };
  }

  componentDidMount() {
    window.addEventListener('hashchange', this.checkHash, false);

    firebase.database().ref(CONTRIBUTIONS_DB).off('value', this.firebaseCallbacks.contributions);
    firebase.database().ref(INTERESTS_DB).off('value', this.firebaseCallbacks.interests);
    firebase.database().ref(VOTES_DB).off('value', this.firebaseCallbacks.votes);

    this.checkHash();
  }

  componentWillMount() {
    var self = this;
    firebase.auth().getRedirectResult().then(function (result) {
      // The signed-in user info.
      self.setState({ user: self.getUserData(result.user) });
    }).catch(function (error) {
      console.log('ERROR', error);
    });

    this.firebaseCallbacks.contributions = firebase.database().ref(CONTRIBUTIONS_DB).on('value', function(snap) {    
      var items: any[] = [];
      snap.forEach(function(itemSnap) {
        items.push(itemSnap.val());
      });
      this.setState({ contributions: items });
    });

    this.firebaseCallbacks.interests = firebase.database().ref(INTERESTS_DB).on('value', function(snap) {    
      var items: any[] = [];
      snap.forEach(function(itemSnap) {
        items.push(itemSnap.val());
      });
      this.setState({ interests: items });
    });

    this.firebaseCallbacks.votes = firebase.database().ref(VOTES_DB).on('value', function(snap) {    
      var items: any[] = [];
      snap.forEach(function(itemSnap) {
        items.push(itemSnap.val());
      });
      this.setState({ votes: items });
    });

    // this.bindAsArray(firebase.database().ref(CONTRIBUTIONS_DB), 'contributions');
    // this.bindAsArray(firebase.database().ref(INTERESTS_DB), 'interests');
    // this.bindAsArray(firebase.database().ref(VOTES_DB), 'votes');
  }

  componentDidUpdate() {
    const {
      interests,
      contributions,
      currentEntryKey,
      shallScroll
    } = this.state;
      
    const entriesCount = document.querySelectorAll('.entry').length;
    const didRender = contributions.length + interests.length === entriesCount;

    if (didRender && shallScroll && (contributions.length || interests.length)) {
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
  getUserData(user: GitHubUserProfile): ContribootUser | null {
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

    const newEntryRef = typeRef.push({
      title: newEntry.title,
      description: newEntry.description,
      user: this.state.user
    });

    newEntryRef.then(result => {
      const newKey = result.key;
      votesRef.child(newKey).set(1);
      //  location.hash = newKey;
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

    return (
      <div className='contriboot'>
        <section className='entries-container'>
          <EntriesList
            title='Contributions'
            type='contributions'
            currentEntryKey={this.state.currentEntryKey}
            entries={this.state.contributions}
            votes={this.state.votes} />
          <EntriesList
            title='Interests'
            type='interests'
            currentEntryKey={this.state.currentEntryKey}
            entries={this.state.interests}
            votes={this.state.votes} />
        </section>

        <h2>Add contrib or interest</h2>

        {isLoggedin ?
          [<Logout user={this.state.user} logout={this.logout} />,
          <AddEntriesForm onEntryAdd={this.handleEntryAdd} />] :
          <Login loginWithGithub={this.loginWithGithub} />
        }

      </div>
    );

  }
}

ReactDOM.hydrate(<App />, document.querySelector('.mount'));
