import "./Sidebar.css";

function Sidebar() {
    return (
        <section className="sidebar">

            <button className="sidebar-header-btn">
                <i className="fa-solid fa-g"></i>
                {/*  <img src='src/assets/logo.png' className="logo" alt='g3-gptlogo'></img> */}
                <i className="fa-solid fa-pen-to-square"></i>
            </button>


            <ul className="history">
                <li>history1</li>
                <li>history2</li>
                <li>history3</li>
                <li>history4</li>
            </ul>

            <div className="last">
                <p>G3-GPT</p>
            </div>
        </section>
    )
}

export default Sidebar; 