import { useState, useEffect, useRef } from 'react';
import useWebSocket from 'react-use-websocket';
import throttle from 'lodash.throttle';
import Cursor from './components/Cursor';

const renderCursors = users => {
    return Object.keys(users).map((uuid) => {
        console.log("nates uuid", uuid);
        console.log("users obj", users);
        const user = users[uuid];
        return (
            <Cursor key={users[uuid].username} point={[user.state.x, user.state.y]} />
        );
    })
};

const renderUserList = users => {
    return (
        <ul>
            {
                Object.keys(users).map((uuid) => {
                    const user = users[uuid];
                    return (<li key={uuid}>{JSON.stringify(user)}</li>);
                })
            }
        </ul>
    )
}

const Home = ({ username }) => {

    const WS_URL = 'ws://127.0.0.1:8000';
    const THROTTLE = 50;
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
        queryParams: { username },
    });

    const sendJsonMessageThrottled = useRef(throttle(sendJsonMessage, THROTTLE));

    useEffect(() => {
        sendJsonMessage({ x: 0, y: 0 });
        window.addEventListener('mousemove', (e) => {
            sendJsonMessageThrottled.current({ x: e.clientX, y: e.clientY });
        });
    }, []);

    if (lastJsonMessage) {
        return (
            <div>
                {renderCursors(lastJsonMessage)}
                {renderUserList(lastJsonMessage)}
            </div>
        );
    }

    return (
        <div>
            <h1>Hello, {username} </h1>
        </div>
    );
}
export default Home;