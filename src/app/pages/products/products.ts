import { Component } from '@angular/core';
import { Banner } from '../../components/banner/banner';
import { CardProduct } from '../../components/card-product/card-product';

@Component({
  selector: 'app-products',
  imports: [Banner, CardProduct],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {}
