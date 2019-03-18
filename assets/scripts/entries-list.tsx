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
/**
 * Renders a list of entries
 */
export default class EntriesList extends React.Component<OwnProps> {
  private handleVote(key: string, votes: number, event: React.MouseEvent<HTMLButtonElement>) {
    localStorage.setItem(key, 'true');
    firebase.database().ref(VOTES_DB).child(key).set(votes + 1).then(() => {
      // everything went well :)
    }).catch((error) => {
      localStorage.removeItem(key);
    });
  }

  private renderVoting(key: string, votes: number, enabled: boolean): JSX.Element {
    const disabledStar: JSX.Element = (<button
      type='button'
      className='entry__header__votes__button'
      disabled>
        &#9733;
      </button>
    );
    const enabledStar: JSX.Element = (<button
      type='button'
      className='entry__header__votes__button'
      onClick={(event) => this.handleVote(key, votes, event)}>
        &#9734;
      </button>
    );

    return (
      <span className='entry__header__votes'>
        {enabled ? disabledStar : enabledStar }
        {votes}
      </span>
    );
  }

  // private renderEntry(entry: ContribootEntry, allVotes?: ContribootVote[], currentEntryKey?: string): JSX.Element {
  private renderEntry(entry: ContribootEntry): JSX.Element {
    const { votes: allVotes, currentEntryKey } = this.props;
    const { '.key': key, title, user, description } = entry;

    const isActive = currentEntryKey === key;
    const entryLink = isActive ? '#none' : `#${key}`;
    const classes = 'entry' + (isActive ? ' entry--active' : '');

    const votesObj: ContribootVote | undefined = allVotes.find((vote: ContribootVote) => {
        return vote['.key'] === key;
      });
    const votes = +(votesObj && votesObj['.value'] || 0);
    const voted = Boolean(votesObj && localStorage.getItem(votesObj['.key']));

    return (
      <li data-key={key} key={key} className={classes}>
        <div className='entry__header'>
          <a
            href={entryLink}
            title={title}
            className='entry__header__title'>
            <h3>
              {title}
              <small className='entry__header__author'>
                by {user.username}
              </small>
            </h3>
          </a>

          {this.renderVoting(key, votes, voted)}
        
        </div>
        
        <div className='entry__description'>
          <ReactMarkdown source={description} />
        </div>
      </li>
    );
  }

  /**
   * Render the entries
   * @return {JSX} The list
   */
  private renderEntries() {
    const { entries } = this.props;
    return (
      <ul>
        {entries.map((entry) => this.renderEntry(entry))}
      </ul>
    );
  }

  /**
   * Render the component
   * @return {JSX} The list
   */
  public render() {
    const { entries, title } = this.props;
    const hasEntries = entries && entries.length;

    return (
      <div className='entries'>
        <h2>{title}</h2>

        {hasEntries ? this.renderEntries() : <Spinner />}
      </div>
    );
  }
}
