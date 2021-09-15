import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreateNewDrawingDialogComponent } from '@app/components/sidebar/create-new-drawing-dialog/create-new-drawing-dialog.component';
import { DrawingsCarouselDialogComponent } from '@app/components/sidebar/drawings-carousel-dialog/drawings-carousel-dialog.component';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

@Component({
    selector: 'app-three-js-home',
    templateUrl: './three-js-home.component.html',
    styleUrls: ['./three-js-home.component.scss'],
})
export class ThreeJSHomeComponent implements OnInit, AfterViewInit {
    mouseX: number = 0;
    mouseY: number = 0;
    targetX: number = 0;
    targetY: number = 0;

    windowX: number = window.innerWidth / 2;
    windowY: number = window.innerHeight / 2;

    camera: any;
    renderer: any;
    mesh: any;
    // css3DRenderer: any;

    constructor(private router: Router, private drawingService: DrawingService, private autoSaveService: AutoSaveService, public dialog: MatDialog) {}

    ngAfterViewInit(): void {
        this.main();
    }

    ngOnInit(): void {
        this.main();
    }

    onMouseMove(event: MouseEvent): void {
        // this.windowX = window.innerWidth / 2;
        // this.windowY = window.innerHeight / 2;
        this.mouseX = event.clientX - this.windowX;
        this.mouseY = event.clientY - this.windowY;

        // this.mesh.position.copy(this.camera.target.clone());
        // let vec3 = new Vector3();
        // vec3 = this.camera.position;
        // this.mesh.position.set(vec3.x, vec3.y, vec3.z + 2);
    }

    onWindowResize(): void {
        this.windowX = window.innerWidth / 2;
        this.windowY = window.innerHeight / 2;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // this.css3DRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    createNewDrawing(windowInnerWidth: number, windowInnerHeight: number): void {
        if (!this.autoSaveService.isAutoSaveDrawingExists()) {
            this.drawingService.newCanvasInitialSize(windowInnerWidth, windowInnerHeight);
        } else {
            this.drawingService.isCreateNewDrawingDialogOpen = true;
            this.dialog
                .open(CreateNewDrawingDialogComponent)
                .afterClosed()
                .subscribe(() => {
                    this.drawingService.isCreateNewDrawingDialogOpen = false;
                });
        }
    }

    openDrawingsCarouselDialog(): void {
        this.drawingService.isDrawingsCarouselDialogOpen = true;
        this.dialog
            .open(DrawingsCarouselDialogComponent, {
                width: '1250px',
                height: 'auto',
            })
            .afterClosed()
            .subscribe(() => {
                this.drawingService.isDrawingsCarouselDialogOpen = false;
            });
    }

    continueDrawing(): void {
        this.autoSaveService.recoverAutoSaveDrawing();
    }

    isContinueDrawingPossible(): boolean {
        return this.autoSaveService.isAutoSaveDrawingExists();
    }

    main(): void {
        // scene of three js box
        const scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 2);

        const canvas: any = document.querySelector('#canvas');
        this.renderer = new THREE.WebGLRenderer({ canvas });

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // scene of css3d buttons
        const scene2 = new THREE.Scene();
        const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera2.position.set(0, 0, 500);
        const css3DRenderer = new CSS3DRenderer();

        const myAbsolutelyNotNullElement = document.querySelector('#container')!;
        myAbsolutelyNotNullElement.appendChild(css3DRenderer.domElement);
        css3DRenderer.setSize(window.innerWidth, window.innerHeight);
        const elem = document.createElement('button');
        const obj = new CSS3DObject(elem);
        obj.position.set(0, 0, 200);
        obj.element.style.border = '2px solid #fa5a85';
        obj.element.style.width = '190px';
        // obj.element.style.height = '25';
        obj.element.style.fontFamily = 'sans-serif';
        obj.element.style.fontWeight = 'bold';
        obj.element.style.color = 'white';
        obj.element.style.padding = '5px';
        obj.element.style.background = '#e64e77';
        obj.element.style.marginTop = '60px';
        obj.element.style.cursor = 'pointer';
        obj.element.textContent = 'Créer un nouveau dessin';
        obj.element.addEventListener('click', () => {
            this.router.navigateByUrl('/editor');
            this.createNewDrawing(window.innerWidth, window.innerHeight);
        });
        scene2.add(obj);

        const elem2 = document.createElement('button');
        const obj2 = new CSS3DObject(elem2);
        obj2.position.set(0, 0, 200);
        obj2.element.style.border = '2px solid #fa5a85';
        obj2.element.style.width = '190px';
        // obj2.element.style.height = '25';
        obj2.element.style.fontFamily = 'sans-serif';
        obj2.element.style.fontWeight = 'bold';
        obj2.element.style.color = 'white';
        obj2.element.style.padding = '5px';
        obj2.element.style.background = '#e64e77';
        obj2.element.style.cursor = 'pointer';
        obj2.element.textContent = 'Ouvrir le carrousel de dessins';
        obj2.element.addEventListener('click', () => {
            this.router.navigateByUrl('/editor');
            this.openDrawingsCarouselDialog();
        });
        scene2.add(obj2);

        const elem3 = document.createElement('button');
        elem3.disabled = this.isContinueDrawingPossible() ? false : true;
        const obj3 = new CSS3DObject(elem3);
        obj3.position.set(0, 0, 200);
        obj3.element.style.border = '2px solid #fa5a85';
        obj3.element.style.width = '190px';
        // obj3.element.style.height = '25';
        obj3.element.style.fontFamily = 'sans-serif';
        obj3.element.style.fontWeight = 'bold';
        obj3.element.style.color = 'white';
        obj3.element.style.padding = '5px';
        obj3.element.style.background = '#e64e77';
        obj3.element.style.marginTop = '-60px';
        obj3.element.style.cursor = 'pointer';
        obj3.element.textContent = 'Continuer un dessin';
        obj3.element.addEventListener('click', () => {
            this.router.navigateByUrl('/editor');
            this.continueDrawing();
        });
        scene2.add(obj3);

        // Box creation
        const boxGeometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({
            color: 0x49ef4,
        });
        const cube = new THREE.Mesh(boxGeometry, material);

        scene.add(cube);

        // const light = new THREE.AmbientLight(0x404040); // soft white light
        // scene.add(light);
        this.renderer.render(scene, this.camera);
        // this.camera3 = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 2000);
        // this.camera3.position.z = 1000;

        // const scene3 = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.001);

        const starsGeometry = new THREE.BufferGeometry();
        const vertices = [];

        const sprite = new THREE.TextureLoader().load(
            'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/spark1.png',
        );

        for (let i = 0; i < 40000; i++) {
            const x = 5000 * Math.random() - 1000;
            const y = 5000 * Math.random() - 1000;
            const z = 5000 * Math.random() - 1000;

            if (i % 2 == 0) vertices.push(x, y, z);
            else vertices.push(-x, -y, -z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const starsMaterial = new THREE.PointsMaterial({ size: 65, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: true });
        starsMaterial.color.setHSL(1.0, 0.3, 0.7);

        const particles = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(particles);
        // const controls = new OrbitControls(camera2, css3DRenderer.domElement);
        // const controls2 = new OrbitControls(camera, renderer.domElement);

        // Background
        // const backgroundTexture = new THREE.TextureLoader().load(
        //     'https://images.unsplash.com/photo-1445905595283-21f8ae8a33d2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80',
        // );
        // scene.background = backgroundTexture;

        // const clock = new THREE.Clock();

        const animate = () => {
            this.targetX = this.mouseX * 0.001;
            this.targetY = this.mouseY * 0.001;

            // cube.rotation.y = 0.5 * clock.getElapsedTime();
            cube.rotation.y = 0.5 * this.targetX;
            cube.rotation.x = 0.5 * this.targetY;

            obj.rotation.y = 0.5 * this.targetX;
            obj.rotation.x = 0.5 * this.targetY;
            obj.position.x = 50 * this.targetX;
            obj.position.y = -50 * this.targetY;

            obj2.rotation.y = 0.5 * this.targetX;
            obj2.rotation.x = 0.5 * this.targetY;
            obj2.position.x = 50 * this.targetX;
            obj2.position.y = -50 * this.targetY;

            obj3.rotation.y = 0.5 * this.targetX;
            obj3.rotation.x = 0.5 * this.targetY;
            obj3.position.x = 50 * this.targetX;
            obj3.position.y = -50 * this.targetY;

            const time = Date.now() * 0.00005;
            // Stars rendering

            particles.position.x += (this.mouseX - this.camera.position.x) * 0.0015;
            particles.position.y += (-this.mouseY - this.camera.position.y) * 0.0015;

            // this.camera3.lookAt(scene.position);
            this.camera.lookAt(cube.position);

            const h = ((360 * (1.0 + time)) % 360) / 360;
            starsMaterial.color.setHSL(h, 0.5, 0.5);
            // material.color.setHSL(h, 0.5, 0.5);
            // material.vertexColors = true;

            // let vec3 = new Vector3();
            // vec3 = this.camera.position;
            // this.mesh.position.set(vec3.x, vec3.y, vec3.z + 2);

            requestAnimationFrame(animate);
            // controls.update();
            // controls2.update();
            // this.renderer.render(scene, camera);
            this.renderer.render(scene, this.camera);
            css3DRenderer.render(scene2, camera2);
        };
        animate();
    }
}
