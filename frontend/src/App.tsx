import React from 'react'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const client = new ApolloClient({
  uri: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/graphql',
  cache: new InMemoryCache(),
  credentials: 'same-origin',
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
  headers: {
    'Content-Type': 'application/json',
  }
})


function HelloMessage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query {
                hello {
                  text
                  created_at
                }
              }
            `
          }),
        });
        
        const result = await response.json();
        console.log('GraphQL response:', result);
        
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
        
        setData(result.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>
  if (error) return (
    <div>
      <p>Error: {error.message}</p>
    </div>
  )

  return (
    <div className="message-container">
      <h2 className="message-text">{data?.hello?.text || 'No message found'}</h2>
      {data?.hello?.created_at && (
        <p className="message-timestamp">Created at: {data.hello.created_at}</p>
      )}
    </div>
  )
}

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="app-container">
        <div className="logo-container">
          <a href="https://vite.dev" target="_blank" rel="noreferrer">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Hello World App</h1>
        <div className="card">
          <HelloMessage />
        </div>
        <p className="read-the-docs">
          React + TypeScript + Capacitor + GraphQL + Firestore
        </p>
      </div>
    </ApolloProvider>
  )
}

export default App
