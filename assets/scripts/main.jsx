import { render, Component } from 'preact';
// import ReactFireMixin from 'reactfire';

import firebase, { VOTES_DB, INTERESTS_DB, CONTRIBUTIONS_DB } from './config.jsx';

import Login from './login.jsx';
import Logout from './logout.jsx';
import EntriesList from './entries-list.jsx';
import AddEntriesForm from './add-entries-form.jsx';

class App extends Component {

  constructor(props) {
    this.state = {
      shallScroll: true,
      contributions: [],
      interests: [],
      votes: [],
      user: null,
      currentEntryKey: null
    };
  }

  componentDidMount() {
    window.addEventListener('hashchange', this.checkHash, false);

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

    this.bindAsArray(firebase.database().ref(CONTRIBUTIONS_DB), 'contributions');
    this.bindAsArray(firebase.database().ref(INTERESTS_DB), 'interests');
    this.bindAsArray(firebase.database().ref(VOTES_DB), 'votes');
  }

  componentDidUpdate() {
    const state = this.state,
      interests = state.interests,
      contributions = state.contributions,
      currentEntryKey = state.currentEntryKey,
      entriesCount = document.querySelectorAll('.entry').length,
      didRender = contributions.length + interests.length === entriesCount;
    let currentElement = null;

    if (didRender && state.shallScroll
      && (contributions.length || interests.length)) {

      currentElement = document.querySelector(
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
  getUserData(user) {
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
  handleEntryAdd(newEntry) {

    const typeRef = firebase.database().ref(newEntry.type),
      votesRef = firebase.database().ref(VOTES_DB),
      newEntryRef = typeRef.push({
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

render(<App />, document.querySelector('.mount'));
