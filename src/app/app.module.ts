import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WebcamRecorderComponent } from './components/webcam-recorder/webcam-recorder.component';
import { VideoListComponent } from './components/video-list/video-list.component';
import { DeleteDialogComponent } from './components/delete-dialog/delete-dialog.component';
import { AppState } from './store/state/app.state';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DurationPipe } from './pipes/duration.pipe';
import { TimePipe } from './pipes/time.pipe';

// Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    WebcamRecorderComponent,
    VideoListComponent,
    DeleteDialogComponent,
    DurationPipe,
    TimePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxsModule.forRoot([AppState], {
      developmentMode: true
    }),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    BrowserAnimationsModule,
    // Material Modules
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
