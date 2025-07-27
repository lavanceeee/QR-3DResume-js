export class SocialButtons3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.buttons = [];
        this.init();
    }

    init() {
        // 创建场景
        this.scene = new THREE.Scene();
        
        // 创建相机
        this.camera = new THREE.PerspectiveCamera(75, 600 / 180, 0.1, 1000);
        this.camera.position.z = 12;
        
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(600, 180);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // 添加到容器
        const container = document.getElementById('social-buttons');
        if (container) {
            container.appendChild(this.renderer.domElement);
        }
        
        // 添加光源
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        this.scene.add(light);
        
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // 创建三个3D按钮
        this.createButtons();
        
        // 开始渲染循环
        this.animate();
        
        // 添加鼠标事件
        this.addMouseEvents();
    }

    createButtons() {
        const buttonData = [
            { 
                name: 'github', 
                url: 'https://github.com/lavanceeee',
                color: 0x333333,
                position: { x: -5, y: 0, z: 0 },
                svgPath: './assets/github_svg.svg'
            },
            { 
                name: 'blog', 
                url: 'https://2jone.top',
                color: 0x007acc,
                position: { x: 0, y: 0, z: 0 },
                svgPath: './assets/blog_svg.svg'
            },
            { 
                name: 'twitter', 
                url: 'https://x.com/lavanceeee',
                color: 0x1da1f2,
                position: { x: 5, y: 0, z: 0 },
                svgPath: './assets/twitter_logo.svg'
            }
        ];

        buttonData.forEach((data, index) => {
            // 创建按钮组
            const buttonGroup = new THREE.Group();
            
            // 创建阴影平面
            const shadowGeometry = new THREE.CircleGeometry(2.4, 32);
            const shadowMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x000000, 
                transparent: true, 
                opacity: 0.3 
            });
            const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
            shadow.position.set(0, -0.7, -0.1);
            shadow.receiveShadow = true;
            buttonGroup.add(shadow);
            
            // 创建按钮主体（圆柱体）
            const geometry = new THREE.CylinderGeometry(2, 2, 0.6, 32);
            const material = new THREE.MeshLambertMaterial({ 
                color: data.color,
                transparent: true,
                opacity: 0.9
            });
            
            const button = new THREE.Mesh(geometry, material);
            button.castShadow = true;
            button.receiveShadow = true;
            buttonGroup.add(button);
            
            // 加载SVG图标
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(data.svgPath, (texture) => {
                const iconMaterial = new THREE.MeshBasicMaterial({ 
                    map: texture,
                    transparent: true
                });
                
                const iconGeometry = new THREE.PlaneGeometry(3.5, 3.5);
                const icon = new THREE.Mesh(iconGeometry, iconMaterial);
                icon.position.set(0, 0, 0.31);
                buttonGroup.add(icon);
            });
            
            // 设置按钮组位置
            buttonGroup.position.set(data.position.x, data.position.y, data.position.z);
            
            // 存储按钮信息
            buttonGroup.userData = {
                url: data.url,
                originalY: data.position.y,
                hovered: false
            };
            
            this.buttons.push(buttonGroup);
            this.scene.add(buttonGroup);
        });
    }

    addMouseEvents() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.buttons, true);
            
            this.buttons.forEach(buttonGroup => {
                const isHovered = intersects.length > 0 && intersects[0].object.parent === buttonGroup;
                
                if (isHovered && !buttonGroup.userData.hovered) {
                    // 鼠标悬停效果
                    buttonGroup.userData.hovered = true;
                    buttonGroup.position.y = buttonGroup.userData.originalY + 0.8;
                    buttonGroup.scale.set(1.3, 1.3, 1.3);
                    this.renderer.domElement.style.cursor = 'pointer';
                } else if (!isHovered && buttonGroup.userData.hovered) {
                    // 鼠标离开效果
                    buttonGroup.userData.hovered = false;
                    buttonGroup.position.y = buttonGroup.userData.originalY;
                    buttonGroup.scale.set(1, 1, 1);
                    this.renderer.domElement.style.cursor = 'default';
                }
            });
        });
        
        this.renderer.domElement.addEventListener('click', (event) => {
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.buttons, true);
            
            if (intersects.length > 0) {
                const buttonGroup = intersects[0].object.parent;
                window.open(buttonGroup.userData.url, '_blank');
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // 添加轻微的浮动动画
        this.buttons.forEach((buttonGroup, index) => {
            const time = Date.now() * 0.001;
            buttonGroup.position.y = buttonGroup.userData.originalY + Math.sin(time + index) * 0.15;
            buttonGroup.rotation.y = Math.sin(time * 0.5 + index) * 0.1;
        });
        
        this.renderer.render(this.scene, this.camera);
    }
}
