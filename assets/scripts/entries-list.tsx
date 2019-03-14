import React from 'react';

import Spinner from 'react-spinner';
import ReactMarkdown from 'react-markdown';

import firebase, { VOTES_DB } from './config';
import { ContribootEntry, ContribootEntryKey, ContribootVote, ContribootEntryType } from './types';

interface OwnProps {
  title: string;
  entries: ContribootEntry[];
  currentEntryKey: ContribootEntryKey;
  votes: any[];
  type: ContribootEntryType;
}

interface EntriesListState {

}
/**
 * Renders a list of entries
 */
export default class EntriesList extends React.Component<OwnProps, EntriesListState> {
  handleVote(key: string, votes: number) {
    const ref = firebase.database().ref(`${VOTES_DB}/${key}`);
    ref.set(votes + 1);
    localStorage.setItem(key, 'true');
  }

  /**
   * Render the entries
   * @return {JSX} The list
   */
  renderEntries() {
    return (
      <ul>
        {
          this.props.entries.map((entry: ContribootEntry, index: number) => {
            const key = entry['.key'];
            const isActive = this.props.currentEntryKey === key;
            const classes = 'entry' + (isActive ? ' entry--active' : '');
            const votesObj = this.props.votes.find((vote: ContribootVote) => {
                return vote['.key'] === entry['.key'];
              });
            const votes = votesObj && votesObj['.value'] || 0;
            const voted = votesObj && localStorage.getItem(votesObj['.key']);

            return (
              <li data-key={key} key={key} className={classes}>
                <div className='entry__header'>
                  <a href={isActive ? '#none' : `#${key}`}
                      title={entry.title}
                      className='entry__header__title'>
                    <h3>
                      {entry.title}
                      <small className='entry__header__author'>
                        by {entry.user.username}
                      </small>
                    </h3>
                  </a>

                  <span className='entry__header__votes'>
                    {voted ?
                      <button type='button'
                        className='entry__header__votes__button' disabled>
                          &#9733;
                      </button> :
                      <button type='button'
                        className='entry__header__votes__button'
                        onClick={() => this.handleVote(entry['.key'], votes)}>
                          &#9734;
                      </button>
                    }
                    {votes}
                  </span>
                </div>
                
                <div className='entry__description'>
                  <ReactMarkdown source={entry.description} />
                </div>
              </li>
            );
          })
        }
      </ul>
    );
  }

  /**
   * Render the component
   * @return {JSX} The list
   */
  render() {
    return (
      <div className='entries'>
        <h2>{this.props.title}</h2>

        {this.props.entries.length ?
          this.renderEntries() :
          <Spinner />
        }
      </div>
    );
  }
}
