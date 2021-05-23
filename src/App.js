import logo from './logo.svg';
import './App.css';
import socket from './components/Socket';
import React, {useState} from 'react';
import TextField from '@material-ui/core/TextField' ;
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polyline} from 'react-leaflet';
import { useEffect } from 'react/cjs/react.development';
import './App.css';
import 'leaflet/dist/leaflet.css';
const icon = L.icon({ iconUrl: "/images/marker-icon.png", iconSize: [10, 15] });
const icon_2 = L.icon({ iconUrl: "/images/asterisco.png", iconSize: [10, 10] });
const color_line = { color: 'blue' }

function App() {
  const [state, setState] = useState({name:'', message:''});
  const [chat, setChat] = useState([]);
  const [vuelos, setVuelos] = useState([{code:'Sin Información', airline:'', origin:[-100,-100], destination:[-100,-100], plane:'', seats: 1, passengers:[{name:'', age:1}]}]);
  const [posicion, setPosicion] = useState({code:'', position: [-100, -100]})

  // CHAT
  const messageSubmit = (e) => {
    e.preventDefault()
    const {name, message} = state
    socket.emit('CHAT', {name: name, message: message})
    setState({message: '', name: ''})
  }

  useEffect(() => {
    socket.on('CHAT', ({name, message, date}) => {
      setChat([...chat, {name, message, date}])
    }) 

    socket.on('FLIGHTS', data => {
      setVuelos(data)
    })  

    socket.on('POSITION', data => {
      setPosicion(data)
    })  
  })

  const onTextChange = e => {
    setState({...state, [e.target.name]: e.target.value})
  }

  const renderChat = () => {
    return chat.map(({name, message, date}, index) => (
      <div key={index}>
        <b>{name}: </b>{message} - <font size="2" color="teal"><em>{(new Date(date)).toLocaleString()}</em></font>
      </div>
    ))
  }
  
  // VUElOS
  const renderPosicion = () => {
    return (<Marker position={[posicion.position[0], posicion.position[1]]} icon={icon_2} key={posicion.code}>
      <Popup>
        Código: {posicion.code}
      </Popup>
    </Marker>)
  }

  const getVuelos = (e) => {
    e.preventDefault()
    socket.emit('FLIGHTS')
  }

  const renderVuelos = () => {
    return vuelos.map(({code, airline, origin, destination, plane, seats, passengers}, index) => (
      <div key={index}>
      <br></br>
      <div className = "card">
        <b>{code}- {airline}</b>
        <br></br>
        <b>Origen:</b> {origin.map((item, j)=> (
            <div key={j}>
              <li>{item}</li>
            </div>))}
        <b>Destino:</b> {destination.map((item, k)=> (
            <div key={k}>
              <li>{item}</li>
            </div>))}
        <b>Avión:</b> {plane}
        <br></br>
        <b>Cantidad asientos:</b> {seats}
        <br></br>
        <b>Pasajeros:</b> {passengers.map(({name, age}, f)=> (
            <div key={f}>
             <li>{name} - {age}</li>
            </div>))}
      </div>
      </div>
    ))
  }

  const renderOrigen = () => {
    return vuelos.map(({origin}, index) => (
      <div key = {index}>
      <Marker position={[origin[0], origin[1]]} icon={icon}></Marker>
      </div>
    ))
  }

  const renderDestino = () => {
    return vuelos.map(({destination}, index) => (
      <div key = {index}>
      <Marker position={[destination[0], destination[1]]} icon={icon}></Marker>
      </div>
    ))
  }

  const renderRuta = () => {
    return vuelos.map(({origin, destination}, index) => (
      <div key = {index}>
      <Polyline pathOptions={color_line} positions={[[origin[0], origin[1]],[destination[0], destination[1]]]} />
      </div>
    ))
  }

  return (
      <div className = "App">
        <div className = "header">
          <h1>Bienvenido a Vuelos</h1>
          <form onSubmit= {getVuelos}>
            <button>Solicitar información de vuelos</button>
          </form>
        </div>
        <div>
          <div className= "column-mapa">
            <h2>Mapa vuelos</h2>
            <MapContainer center={[-5,10]} zoom={2} scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {renderOrigen()}
              {renderDestino()}
              {renderRuta()}
              {renderPosicion()}
            </MapContainer>
          </div>
          <div className="column-chat">
              <h2>Centro de control</h2>
              <div className="container">
              {renderChat()}
              </div>
            <form onSubmit = {messageSubmit}>
                <div className = "name_field">
                  <TextField name= "name" onChange={e => onTextChange(e)} value={state.name} label="name" variant="outlined"/>
                </div>
                <br></br>
                <div className = "message_field">
                  <TextField name= "message" onChange={e => onTextChange(e)} value={state.message} label="message" id="outlined-multiline-static" variant="outlined" />
                </div>
                <button>Enviar</button>
            </form>
          </div>
        </div>
        <div className="column-info">
          <h2>Información de vuelos</h2>
          {renderVuelos()}
        </div>
      </div>
  );
}
export default App;
