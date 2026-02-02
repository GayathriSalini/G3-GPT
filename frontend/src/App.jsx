import './App.css'
import Sidebar from './Sidebar.jsx';
import ChatWindow from './chatWindow.jsx';
import { MyContext } from './Mycontext.jsx';

function App() {
   const provideValue = {};

  return (

    <div className="main">
      <MyContext.Provider value={provideValue}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>

  )
}

export default App
