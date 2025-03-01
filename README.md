This is my thesis project. Thesis can be found here: https://trepo.tuni.fi/bitstream/handle/10024/204924/LalloKonsta.pdf?sequence=2&isAllowed=y

This is the Android application / User interface for the thesis project.

Here you can find the embedded system implementation https://github.com/Galaksus/VeneilyApp_esp32

The project as a whole is about an embedded system that is designed for electric outboard motors that are used in rowing boats.
The system is a box that is attached to the electric outboard motor. You can find images of the physical system from this repository (link under progress).

**So what does the system do?**
 - Enables adjusting of the rotation speed and direction of the electric outboard motor, meaning the motor is now fully wirelessly controlled by the user. (The user controls these with an Android application)
 - Enables user to steer the motor (and the boat) wirelessly through the application.
 - Enables fully automatic steering of the boat according to a predefined route (in the Android user interface, the user can create, save and drive self-made routes) the steering is based on the data received from the GPS and compass modules and the steering is calculated based on them.

**Most important technologies**
 - Bluetooth low energy (BLE) for wireless data transfer between Android and embedded sytem.
 - Android application with web-based user interface.
 - OpenStreetMap/OpenSeaMap within Android application.
 - Leaflet JavaScript library for interactive map use and manipulation

 
Default view of Android Application:

<img src="https://github.com/user-attachments/assets/dcc276bd-7df4-4a42-9f32-29d8aa732e27" alt="Default view" width="300"/>

View of available features:

<img src="https://github.com/user-attachments/assets/fab1ee81-4edf-4554-9647-fbee8f659f35" alt="Available features" width="300"/>

View of Manual mode control widgets:

<img src="https://github.com/user-attachments/assets/0a371c22-5e0a-46f4-b78f-a553587074d5" alt="Manual mode control" width="300"/>

View of creation of a new route for Automatic mode:

<img src="https://github.com/user-attachments/assets/db112e0d-7873-4267-8c2f-bd1d32843571" alt="New route creation" width="300"/>

