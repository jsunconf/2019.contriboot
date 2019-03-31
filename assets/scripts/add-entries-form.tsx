import marked from 'marked';
import toMarkdown from 'to-markdown';
import Editor from 'react-medium-editor';
import React from 'react';
import { ContribootEntry, ContribootEntryType } from './types';
import { isProposal, PROPOSALS, isInterest, INTERESTS } from './static';

type AddEntriesFormState = ContribootEntry;

type OwnProps = {
  onEntryAdd: (entry: ContribootEntry) => void;
};

const initialState: AddEntriesFormState = {
  type: PROPOSALS,
  title: '',
  description: ''
}

export default class AddEntriesForm extends React.Component<OwnProps, AddEntriesFormState> {
  /**
   * The constructor. Calls the super constructor.
   * @param  {Object} props The properties object.
   */
  constructor(props: OwnProps) {
    super(props);
    this.state = initialState;
  }

  /**
   * Updates firebase with the new state after the submit button was clicked.
   * @param  {Event} event The submit event.
   */
  onSubmit(event: Event) {
    event.preventDefault();

    this.props.onEntryAdd({
      type: this.state.type,
      title: this.state.title,
      description: this.state.description
    });

    this.setState(initialState);
  }

  /**
   * Returns the component.
   * @return {React.Element}
   */
  render(): JSX.Element {
    const submitText = 'Add ' +
      (isProposal(this.state.type) ? 'Talk Proposal' : 'Interest');

    return (
      <form className="submit-form"
        onSubmit={this.onSubmit.bind(this)}>

        <header className="submit-form__header">
          <h3>
            I want to submit a
          </h3>

          <fieldset className="submit-form__type-selection">
            <input type='radio'
              onChange={event => this.setState({type: event.target.value as ContribootEntryType})}
              id={PROPOSALS}
              name='type'
              className=''
              checked={isProposal(this.state.type)}
              value={PROPOSALS} />
            <label className='button button--small' htmlFor={PROPOSALS}>Talk Proposal</label>

            <input type='radio'
              onChange={event => this.setState({type: event.target.value as ContribootEntryType})}
              id={INTERESTS}
              name='type'
              className=''
              checked={isInterest(this.state.type)}
              value={INTERESTS} />
            <label className='button button--small' htmlFor={INTERESTS}>Interest</label>

          </fieldset>

        </header>

        <fieldset>
          <label htmlFor='title'>
            Title
          </label>
          <input type='text'
            onChange={event => this.setState({title: event.target.value})}
            id='title'
            name='title'
            value={this.state.title} />

          <label htmlFor='description'>
            Description
          </label>

          <Editor
            className="textarea"
            id='description'
            name='description'
            text={marked(this.state.description)}
            onChange={(html: string) => this.setState({description: toMarkdown(html)})}
            options={{
              paste: {
                cleanPastedHTML: true
              },
              toolbar: {
                buttons: []
              }}}/>
        </fieldset>

        <button
          type='submit'
          disabled={this.state.title === '' || this.state.description === ''}
          className='button button--small'>
            {submitText}
        </button>
      </form>
    );
  }
}
