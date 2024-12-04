Kiosk Setup: https://blog.r0b.io/post/minimal-rpi-kiosk/

edit kiosk script: sudo nano /etc/systemd/system/kiosk_app.service

edit kiosk chrome init: sudo nano /home/broadcasting/.xinitrc

when chrome is erroring:
rm -rf ~/.config/chromium/Singleton\*

VScode SSH crashes pi when kiosk_app.service is running

add and edit networks on the raspberry pi via a GUI:
`sudo nmtui`
