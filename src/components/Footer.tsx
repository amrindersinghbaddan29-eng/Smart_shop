import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="shop-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="shop-logo mb-3">SmartShop</div>
            <p>Your one-stop online shopping destination for electronics, fashion, home goods, and more. Quality products, fast delivery, and great prices.</p>
            <div className="d-flex gap-2 mt-3">
              <a href="#" className="icon-btn"><i className="bi bi-facebook"></i></a>
              <a href="#" className="icon-btn"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="icon-btn"><i className="bi bi-instagram"></i></a>
              <a href="#" className="icon-btn"><i className="bi bi-youtube"></i></a>
            </div>
          </div>
          <div className="col-md-2 col-6">
            <h6>Shop</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link to="/shop">All Products</Link></li>
              <li><Link to="/shop?cat=electronics">Electronics</Link></li>
              <li><Link to="/shop?cat=fashion">Fashion</Link></li>
              <li><Link to="/shop?cat=home-living">Home</Link></li>
            </ul>
          </div>
          <div className="col-md-2 col-6">
            <h6>Account</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link to="/profile">My Profile</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/addresses">Addresses</Link></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6>Get in touch</h6>
            <p className="mb-2"><i className="bi bi-geo-alt me-2"></i>123 Market Street, Mumbai, India</p>
            <p className="mb-2"><i className="bi bi-envelope me-2"></i>support@smartshop.com</p>
            <p className="mb-0"><i className="bi bi-telephone me-2"></i>+91 98765 43210</p>
          </div>
        </div>
        <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,.1)' }} />
        <div className="d-flex justify-content-between flex-wrap">
          <p className="mb-0">© 2026 SmartShop. All rights reserved.</p>
          <p className="mb-0">Built as a university major project.</p>
        </div>
      </div>
    </footer>
  )
}
