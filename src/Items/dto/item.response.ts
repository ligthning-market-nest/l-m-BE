import { Category } from '../entities/category.enum';
import { Status } from '../entities/status.enum';



export class ItemImageResponse {
    id: number;
    url: string;
}


export class ItemSellerResponse {
    id: number;
    nickname: string | null;
}



export class ItemResponse {
    id: number;
    name: string;
    status: Status;
    description: string;
    price: number;
    category: Category;
    stock: number;
    tags: string[];
    directTrade: boolean;
    seller: ItemSellerResponse;
    images: ItemImageResponse[];
    createdAt: Date;
    updatedAt: Date;
}