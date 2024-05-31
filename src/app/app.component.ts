import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Quagga from 'quagga';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{

  @ViewChild('video') video!: ElementRef;

  BarcodeResult: string = "TestResult";

  constructor() { }

  ngOnInit(): void {
    this.startCamera();
  }

  startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({  video: {
        facingMode: { ideal: 'environment' }, // Prefer the back camera
        width: { min: 640 },
        height: { min: 480 }
      }}).then(stream => {
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.play();

        console.log(this.video.nativeElement)
        this.startScanner();

      }).catch(error => {
        console.error('Error accessing the camera', error);
      });
    } else {
      console.error('MediaDevices interface not available.');
    }

  }

  startScanner() {
    console.log("Start scanner")
    Quagga.init({
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: this.video.nativeElement, // Use the video element
        constraints: {
          width: 640,
          height: 480,
          facingMode: { ideal: 'environment' } // or 'user' for front camera
        }
      },
      decoder: {
        readers: ['code_128_reader', 'ean_reader', 'ean_8_reader', 'code_39_reader', 'code_39_vin_reader', 'codabar_reader', 'upc_reader', 'upc_e_reader', 'i2of5_reader']
      }
    }, (err: any) => {
      if (err) {
        console.error(err);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected((result: { codeResult: { code: string; }; }) => {
      this.BarcodeResult = 'Barcode detected and processed : [' + result.codeResult.code + ']', result
      console.log('Barcode detected and processed : [' + result.codeResult.code + ']', result);
      // Do something with the result, like displaying it on the screen or sending it to a server
    });
  }

  stopScanner() {
    Quagga.stop();
  }
}
