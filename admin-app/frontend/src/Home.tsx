import axios from "axios";
import firebase from "firebase/compat/app";
import useCommonProps from "./hooks";

export default function Home() {
  const {user} = useCommonProps();

  async function sendRequest() {
    if (!user) {
      return;
    }
    const idToken = await user.getIdToken(false);
    axios.request({method: "POST", url: "/api/update-token", headers: {"Authorization": idToken}})
      .then(res => console.log(res))
      .catch(error => {
        console.log(error);
      });
  }

  return (
    <>
      <div className='app'>
        <div className='content'>
          <h1>Auto Instagram Poster</h1>
          <h2>Admin App</h2>
          <p>Welcome {user.displayName}!</p>
          <button onClick={() => firebase.auth().signOut()}>Sign Out</button>
          <button onClick={() => sendRequest()}>Test</button>
        </div>
      </div>
    </>
  )
}