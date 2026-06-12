import { useEffect, useState } from "react";
 
function App() {
 
  const [helloMessage, setHelloMessage] = useState('-');
  const [echoMessage, setEchoMessage] = useState('');
  const [echoEchoMessage, setEchoEchoMessage] = useState('');
 
  const sendEchoMessage = async () => {
    const response = await fetch('/api/echo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: echoMessage })
    });
    const data = await response.json();
    return data.echo;
  }
 
  useEffect(() => {
    if (echoMessage) {
      sendEchoMessage().then(setEchoEchoMessage);
    }
  }, [echoMessage]);
 
  const handleClick = async () => {
    const response = await fetch('/api/hello');
    const data = await response.json();
    setHelloMessage(data.message);
  }
 
  return (
    <>
      <h1>Live VL4</h1>
      <p>{helloMessage}</p>
      <button onClick={handleClick}>Get Hello Message</button>
      <br />
      <input
        type="text"
        placeholder="Type something..."
        className="border p-2 mt-4"
        onChange={(e) => setEchoMessage(e.target.value)}
      />
      <br />
      <p>{echoEchoMessage}</p>
 
    </>
  )
}
 
export default App