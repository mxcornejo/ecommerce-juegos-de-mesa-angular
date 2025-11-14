import { Component } from '@angular/core';
import { Hero } from '../../components/hero/hero';
import { Categories } from '../../components/categories/categories';

@Component({
  selector: 'app-home',
  imports: [Hero, Categories],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
