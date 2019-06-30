import _ from "lodash";
import * as React from "react";
import Frame from "../components/Frame";
import Product from "../entities/Product";
import "../style.less";
import {GlobalState} from "./_app";

class ProductsPage extends React.Component<Props, State> {
  
  constructor(props: Props) {
    super(props);
    this.state = {
      error:   0,
      loading: false,
      product: {key: "", title: "", description: "", image: "", price: 0, stock: 0},
    };
    this.changeInput = this.changeInput.bind(this);
    this.changeUpdateProductTitle = this.changeUpdateProductTitle.bind(this);
    
    this.clickCreateProduct = this.clickCreateProduct.bind(this);
    this.clickUpdateProduct = this.clickUpdateProduct.bind(this);
    this.clickDeleteProduct = this.clickDeleteProduct.bind(this);
  }
  
  public async componentDidMount() {
    this.setState(Object.assign(this.state, {loading: true}));
    await Product.find();
    this.setState(Object.assign(this.state, {loading: false}));
  }
  
  private async clickCreateProduct(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const response = await Product.create(this.state.product.key, this.state.product.title, this.state.product.description, this.state.product.image, this.state.product.price, this.state.product.stock);
    if (response instanceof Product) {
      this.setState(Object.assign(this.state, {product: {key: "", title: "", description: "", image: "", price: 0, stock: 0}} as State));
    }
    else {
      this.setState(Object.assign(this.state, {error: response.code}));
    }
  }
  
  private async clickUpdateProduct(e: React.MouseEvent<HTMLButtonElement>, product: Product) {
    e.preventDefault();
    const response = await Product.update(product);
    if (!(response instanceof Product)) {
      this.setState(Object.assign(this.state, {error: response.code}));
    }
  }
  
  private async clickDeleteProduct(e: React.MouseEvent<HTMLButtonElement>, product_id: string) {
    e.preventDefault();
    const response = await Product.remove(product_id);
    if (response.code !== 200) {
      this.setState(Object.assign(this.state, {error: response.code}));
    }
  }
  
  private changeInput(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState(_.merge(this.state, {product: {[event.target.id]: event.target.value}}) as State);
  }
  
  private changeUpdateProductTitle(event: React.ChangeEvent<HTMLInputElement>, product: Product) {
    Product.products[product.id].title = event.target.value;
    this.setState(this.state);
  }
  
  private changeUpdateProductKey(event: React.ChangeEvent<HTMLInputElement>, product: Product) {
    Product.products[product.id].key = event.target.value;
    this.setState(this.state);
  }
  
  private changeUpdateProductDescription(event: React.ChangeEvent<HTMLTextAreaElement>, product: Product) {
    Product.products[product.id].description = event.target.value;
    this.setState(this.state);
  }
  
  private changeUpdateProductImage(event: React.ChangeEvent<HTMLInputElement>, product: Product) {
    Product.products[product.id].image = event.target.value;
    this.setState(this.state);
  }
  
  private changeUpdateProductStock(event: React.ChangeEvent<HTMLInputElement>, product: Product) {
    Product.products[product.id].stock = +event.target.value;
    this.setState(this.state);
  }
  
  private changeUpdateProductPrice(event: React.ChangeEvent<HTMLInputElement>, product: Product) {
    Product.products[product.id].price = +event.target.value;
    this.setState(this.state);
  }
  
  public render() {
    return (
      // TODO: CREATE UPDATE AND REMOVE PRODUCT UI AND CALLS
      
      <Frame title="Admin | Webshop" globals={this.props.globals}>
        <div id="admin">
          <div id="admin-products">
            {Object.values(Product.products).map((product, key) => {
              return (
                <div className="product" key={key}>
                  <div className="graphic">
                    <div className="stock">
                      <label htmlFor={"product-stock-" + key}>Stock:</label>
                      <input id={"product-stock-" + key} value={product.stock} onChange={event => this.changeUpdateProductStock(event, product)}/>
                    </div>
                    <img src={product.image} alt="missing"/>
                    <div className="price">
                      <label htmlFor={"product-price-" + key}>Price:</label>
                      <input id={"product-price-" + key} value={product.price} onChange={event => this.changeUpdateProductPrice(event, product)}/>
                    </div>
                  </div>
                  <div className="info">
                    <div className="title">
                      <label htmlFor={"product-title-" + key}>Title:</label>
                      <input id={"product-title-" + key} value={product.title} onChange={event => this.changeUpdateProductTitle(event, product)}/>
                    </div>
                    <div className="key">
                      <label htmlFor={"product-key-" + key}>Key:</label>
                      <input id={"product-title-" + key} value={product.key} onChange={event => this.changeUpdateProductKey(event, product)}/>
                    </div>
                    <div className="description">
                      <label htmlFor={"product-description-" + key}>Description:</label>
                      <textarea id={"product-description-" + key} value={product.description} onChange={event => this.changeUpdateProductDescription(event, product)}/>
                    </div>
                    <div className="image">
                      <label htmlFor={"product-image-" + key}>Image:</label>
                      <input id={"product-image-" + key} value={product.image} onChange={event => this.changeUpdateProductImage(event, product)}/>
                    </div>
                  </div>
                  <div className="buttons">
                    <button onClick={e => this.clickUpdateProduct(e, product)}>Update Product</button>
                    <button onClick={e => this.clickDeleteProduct(e, product.id)}>Delete Product</button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div id="admin-create-product">
            <div>
              <label htmlFor="key">Key</label>
              <input id="key" type="text" value={this.state.product.key} onChange={this.changeInput}/>
            </div>
            <div>
              <label htmlFor="title">Title</label>
              <input id="title" type="text" value={this.state.product.title} onChange={this.changeInput}/>
            </div>
            <div>
              <label htmlFor="description">Description</label>
              <input id="description" type="text" value={this.state.product.description} onChange={this.changeInput}/>
            </div>
            <div>
              <label htmlFor="image">Image</label>
              <input id="image" type="text" value={this.state.product.image} onChange={this.changeInput}/>
            </div>
            <div>
              <label htmlFor="price">Price</label>
              <input id="price" type="number" value={this.state.product.price} onChange={this.changeInput}/>
            </div>
            <div>
              <label htmlFor="stock">Stock</label>
              <input id="stock" type="number" value={this.state.product.stock} onChange={this.changeInput}/>
            </div>
            <button onClick={this.clickCreateProduct}>Add a product</button>
          </div>
        </div>
      </Frame>
    );
  }
  
}

interface Props {
  globals: GlobalState
}

interface State {
  error: number
  loading: boolean
  product: {
    key: string
    title: string
    description: string
    image: string
    stock: number
    price: number
  }
}

export default ProductsPage;
