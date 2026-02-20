import { EventSourceMessage, fetchEventSource } from '@microsoft/fetch-event-source';
import React from 'react';
import {
  AskResponse,
  AssistantSettings,
  batchQuery,
  ChatEntryReference,
  ChatHistory,
  ChatHistoryEntry,
  ConversationRequestDto,
  ModelId,
  Origin,
  SkHeaders,
  useAssistantStore,
  useSessions,
} from '@sk-web-gui/ai';

const MAX_REFERENCE_COUNT = 3;

interface useChatOptions {
  settings?: AssistantSettings;
  sessionId?: string;
  apiBaseUrl?: string;
  stream?: boolean;
}

export const useChat = (options?: useChatOptions) => {
  const sessionId = React.useMemo(() => options?.sessionId || '', [options?.sessionId]);
  const _incomingSettings = React.useMemo(() => options?.settings, [options?.settings]);

  const [currentSession, setCurrentSession] = React.useState<string>(sessionId || '');
  const [_settings, _stream, _apiBaseUrl, apikey] = useAssistantStore((state) => [
    state.settings,
    state.stream,
    state.apiBaseUrl,
    state.apikey,
  ]);
  const settings = _incomingSettings || _settings;
  const { assistantId, user: _user, hash, app } = settings;
  const user = _user || '';
  const stream = (options?.stream || _stream) ?? true;
  const apiBaseUrl = options?.apiBaseUrl || _apiBaseUrl;
  const isGroupChat = options?.settings?.is_group_chat ?? _settings.is_group_chat ?? false;

  const [session, getSession, newSession, updateHistory, updateSession, setDone, changeSessionId] = useSessions(
    (state) => [
      state.sessions[currentSession],
      state.getSession,
      state.newSession,
      state.updateHistory,
      state.updateSession,
      state.setDone,
      state.changeSessionId,
    ]
  );

  const history = session?.history || [];
  const done = session?.done;
  const isNew = session?.isNew;

  const createNewSession = React.useCallback(() => {
    const id = newSession();
    setCurrentSession(id);
    // eslint-disable-next-line
  }, [sessionId]);

  const updateSessionId = (id: string) => {
    changeSessionId(currentSession, id);
    setCurrentSession(id);
  };

  const setSessionName = (name?: string) => {
    const _name = name || history.at(0)?.text || '';
    updateSession(currentSession, (session) => ({ ...session, name: _name, updated_at: new Date() }));
  };

  React.useEffect(() => {
    if (sessionId) {
      if (sessionId !== currentSession)
        getSession(sessionId).then((session) => {
          if (!session) {
            createNewSession();
          } else {
            setCurrentSession(sessionId);
          }
        });
    } else {
      createNewSession();
    }
    // eslint-disable-next-line
  }, [sessionId]);

  const addHistoryEntry = (
    origin: Origin,
    text: string,
    id: string,
    done: boolean,
    references: ChatEntryReference[] = []
  ) => {
    const historyEntry: ChatHistoryEntry = {
      origin: origin,
      text,
      id,
      done,
      ...references,
    };
    updateHistory(currentSession, (history) => [...(history || []), historyEntry]);
  };

  const streamQuery = (
    query: string,
    assistantId: string,
    session_id: string,
    user?: string,
    hash?: string,
    files?: ModelId[],
    addToHistory: boolean = true
  ) => {
    const answerId = crypto.randomUUID();

    if (!session.name) {
      setSessionName(query);
    }
    setDone(currentSession, false);

    if (addToHistory) {
      addHistoryEntry('assistant', '', answerId, false);
    }

    const url = `${apiBaseUrl}/conversations`;

    let _id = '';
    let references: ChatEntryReference[];

    const skHeaders: SkHeaders = {
      _skuser: user,
      _skassistant: assistantId,
      _skhash: hash,
      _skapp: app || '',
      _apikey: apikey,
    };

    const body: ConversationRequestDto = {
      question: query,
      session_id: isNew ? undefined : session_id || undefined,
      assistant_id: isGroupChat ? undefined : assistantId,
      group_chat_id: isGroupChat ? assistantId : undefined,
      stream: true,
      files: files || undefined,
    };

    fetchEventSource(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Accept: 'text/event-stream',
        ...skHeaders,
      },
      onopen(res: Response) {
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          if (addToHistory) {
            updateHistory(currentSession, (history: ChatHistory) => {
              const newHistory = [...history];
              const index = history.findIndex((chat) => chat.id === answerId);
              if (index > -1) {
                newHistory[index] = {
                  origin: 'system',
                  text: 'Ett fel inträffade, assistenten gav inget svar.',
                  id: answerId,
                  done: true,
                };
              }
              return newHistory;
            });
          }
          console.error('Client-side error ', res);
        }
        return Promise.resolve();
      },
      onmessage(event: EventSourceMessage) {
        let parsedData: AskResponse;
        if (addToHistory) {
          try {
            parsedData = JSON.parse(event.data);
          } catch {
            console.error('Error when parsing response as json. Returning.');
            return;
          }
          if (currentSession !== parsedData.session_id && isNew) {
            _id = parsedData.session_id;
          }

          references =
            parsedData.references
              ?.filter((reference) => !!reference.metadata.url)
              .map((reference) => ({
                title: reference.metadata.title || reference.metadata.url || '',
                url: reference.metadata.url || '',
              })) || [];
          updateHistory(currentSession, (history: ChatHistory) => {
            const newHistory = [...history];
            const index = history.findIndex((chat) => chat.id === answerId);
            const newAssistantInfo = parsedData?.tools?.assistants?.[0]
              ? {
                  id: parsedData.tools.assistants[0].id,
                  name: parsedData.tools.assistants[0].handle,
                }
              : undefined;

            if (index === -1) {
              newHistory.push({
                origin: 'assistant',
                text: parsedData.answer,
                id: answerId,
                assistantInfo: newAssistantInfo,
                done: false,
              });
            } else {
              newHistory[index] = {
                origin: 'assistant',
                text: history[index]?.text + parsedData.answer,
                id: answerId,
                done: false,
                assistantInfo: newAssistantInfo ?? history[index]?.assistantInfo,
              };
            }

            return newHistory;
          });
        }
      },
      onclose() {
        let id = currentSession;
        if (currentSession !== _id && isNew) {
          updateSessionId(_id);
          id = _id;
        }
        if (addToHistory) {
          let answer = '';
          updateHistory(id, (history: ChatHistory) => {
            const newHistory = [...history];
            const index = newHistory.findIndex((chat) => chat.id === answerId);
            answer = history[index].text;

            newHistory[index] = {
              origin: history[index].origin,
              text: answer,
              id: answerId,
              done: true,
              assistantInfo: history[index]?.assistantInfo,
              references: references.slice(0, MAX_REFERENCE_COUNT),
            };
            return newHistory;
          });
        }
        setDone(currentSession, true);
      },
      onerror(err: unknown) {
        console.error('There was an error from server', err);
        addHistoryEntry('system', 'Ett fel inträffade, kunde inte kommunicera med assistent.', '0', true);
        setDone(currentSession, true);
        throw err;
      },
    }).catch(() => setDone(currentSession, true));
  };

  const sendQuery = (
    query: string,
    files?: ModelId[],
    addToHistory?: { question: boolean; answer: boolean } | boolean
  ) => {
    const addQuestionToHistory = typeof addToHistory === 'boolean' ? addToHistory : (addToHistory?.question ?? true);
    const addAnswerToHistory = typeof addToHistory === 'boolean' ? addToHistory : (addToHistory?.answer ?? true);

    if (!assistantId) {
      addHistoryEntry('system', 'Ett fel inträffade, ingen assistent att kommunicera med.', '0', true);
      setDone(currentSession, true);
      return;
    }
    const questionId = crypto.randomUUID();
    if (addQuestionToHistory) {
      addHistoryEntry('user', query, questionId, true);
    }

    if (stream) {
      streamQuery(query, assistantId, isNew ? '' : currentSession, user, hash ?? '', files, addAnswerToHistory);
    } else {
      setDone(currentSession, false);
      const answerId = crypto.randomUUID();
      if (!session.name) {
        setSessionName(query);
      }
      if (addAnswerToHistory) {
        addHistoryEntry('assistant', '', answerId, false);
      }
      return batchQuery(query, isNew ? '' : currentSession, settings, files)
        .then((res: AskResponse) => {
          if (addAnswerToHistory) {
            updateHistory(currentSession, (history) => {
              const newHistory = [...history];
              const index = history.findIndex((entry) => entry.id === answerId);
              newHistory[index].text = res.answer;
              newHistory[index].assistantInfo = res?.tools?.assistants?.[0]
                ? { name: res?.tools?.assistants?.[0]?.handle, id: res?.tools?.assistants?.[0]?.id }
                : undefined;
              newHistory[index].done = true;

              const refenrences =
                res.references?.slice(0, MAX_REFERENCE_COUNT).map((reference) => ({
                  title: reference.metadata.title || '',
                  url: reference.metadata.url || '',
                })) || [];
              newHistory[index].references = refenrences;

              return newHistory;
            });
          }
          setDone(currentSession, true);
          if (session.id !== res.session_id && isNew) {
            updateSessionId(res.session_id);
          }
          return res;
        })
        .catch((e) => {
          console.error('Error occured:', e);
          if (addAnswerToHistory) {
            updateHistory(currentSession, (history) => {
              const newHistory = [...history];
              const index = history.findIndex((entry) => entry.id === answerId);
              newHistory[index].origin = 'system';
              newHistory[index].text = 'Ett fel inträffade, assistenten gav inget svar';
              newHistory[index].done = true;
              return newHistory;
            });
          }
          setDone(currentSession, true);
        });
    }
  };

  return {
    history,
    addHistoryEntry,
    newSession: createNewSession,
    done,
    session,
    sendQuery,
  };
};
