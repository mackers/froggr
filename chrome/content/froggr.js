var sprites;
var frog;
var fly;
var croc;
var play_area_width = 630;
var play_area_height = 444;
var score;
var level;
var fly_counter = 0;
var croc_counter = 0;

var ghost_cars = 0;

function Frog(elem)
{
	this.elem = elem;

	this.left = parseInt(elem.getAttribute("left"));
	this.top = parseInt(elem.getAttribute("top"));
	this.width = parseInt(elem.getAttribute("width"));
	this.height = parseInt(elem.getAttribute("height"));

	this.start_left = this.left;
	this.start_top = this.top;
	this.home_occupied = new Array(5);
	this.lives = 0;
	this.dead = 0;

	this.go_up = frog_up;
	this.go_down = frog_down;
	this.go_left = frog_left;
	this.go_right = frog_right;
	this.ride = frog_ride;
	this.redraw = frog_redraw;
	this.die = frog_die;
	this.new_life = frog_new_life;
	this.home = frog_home;
	this.check_is_home = frog_check_is_home;
	this.check_is_riding = frog_check_is_riding;

	this.new_life();
}

function frog_check_is_home()
{
	if (this.top == 0)
	{
		var home = 0;

		for (var i=0; i<5; i++)
		{
			if (
				(this.left > (126*i) + 20) &&
				(this.left + this.width < (126*i) + 106) &&
				(!this.home_occupied[i])
			   )
			{
				if (croc.position != i)
				{
					this.home(i);
					home = 1;
					break;
				}
			}
		}

		if (home == 0)
		{
			this.die();
		}
	}
}

function frog_check_is_riding()
{
	if (this.top < 222)
	{
		if (this.riding == null)
		{
			this.die();
		}
		else
		{
			this.ride();
		}
	}
}

function frog_new_life()
{
	this.left = this.start_left;
	this.top = this.start_top;
	this.direction = "n";
	this.riding = null;
	this.dead = 0;

	document.getElementById("lives").setAttribute("value", this.lives);

	this.redraw();
}

function frog_die()
{
	if (this.lives == 0)
	{
		this.dead = 1;
		add_message("Game Over!");
		setTimeout("new_game()", 2000);
		return;
	}

	this.lives--;
	//setTimeout("new_life()", 1000);
	this.new_life();
}

function frog_redraw()
{
	this.elem.top = this.top;
	this.elem.left = this.left;
	this.elem.src = "images/frog1-" + this.direction + ".png";
	this.riding = null;
}

function frog_ride()
{
	 if (this.riding != null && !this.dead)
	{
		this.left += this.riding.direction * (this.riding.speed + level);
	}
}

function frog_home(i)
{
	this.home_occupied[i] = 1;

	if (fly.position == i)
	{
		fly.hide();
		add_score(400);
	}
	else
	{
		add_score(100);
	}

	document.getElementById("home" + i).src = "images/goal1-full.png";

	this.new_life();

	for (var j=0; j<5; j++)
	{
		if (!this.home_occupied[j]) return;
	}

	add_score(500);
	clear_homes();
	level++;
	add_message("Level " + (level+1));
}

function frog_up()
{
	if (this.dead) return;

	this.top -= 37;
	if (this.top < 0) { this.top = 0; }

	this.direction = "n";

	add_score(10);
}

function frog_down()
{
	if (this.dead) return;

	this.top += 37;
	if (this.top + this.height > play_area_height) { this.top = play_area_height - 37; }

	this.direction = "s";
}

function frog_left()
{
	if (this.dead) return;

	if (this.left > 37)
	{ 
		this.left -= 37;
	}

	this.direction = "w";
}


function frog_right()
{
	if (this.dead) return;

	if (this.left + 37 < play_area_width)
	{ 
		this.left += 37;
	}

	this.direction = "e";
}

function Croc(elem)
{
	this.elem = elem;
	this.position = -1;

	this.show = croc_show;
	this.preview = croc_preview;
	this.hide = croc_hide;
	this.redraw = croc_redraw;
}

function croc_preview()
{
	while (1)
	{
		this.position = Math.floor(Math.random()*5);

		if (!frog.home_occupied[this.position]) break;
	}

	this.elem.src = "images/croc3.png";
	this.redraw();
}

function croc_hide()
{
	this.position = -1;
	this.redraw();
}

function croc_show()
{
	this.elem.src = "images/croc2.png";
	this.redraw();
}

function croc_redraw()
{
	this.elem.left = (126 * this.position);
}


function Fly(elem)
{
	this.elem = elem;
	this.position = -1;

	this.show = fly_show;
	this.hide = fly_hide;
	this.redraw = fly_redraw;
	this.toggle = fly_toggle;
}

function fly_toggle()
{
	if (this.position < 0)
	{
		this.show();
	}
	else
	{
		this.hide();
	}
}

function fly_hide()
{
	this.position = -1;
	this.redraw();
}

function fly_show()
{
	while (1)
	{
		this.position = Math.floor(Math.random()*5);

		if (!frog.home_occupied[this.position]) break;
	}

	this.redraw();
}

function fly_redraw()
{
	this.elem.left = 51 + (126 * this.position);
}

function Sprite(elem, direction, speed, type, min_level)
{
	this.elem = elem;
	this.direction = direction;
	this.speed = speed;
	this.type = type;
	this.min_level = (min_level?min_level:0);

	this.left = parseInt(elem.getAttribute("left"));
	this.top = parseInt(elem.getAttribute("top"));
	this.width = parseInt(elem.getAttribute("width"));
	this.height = parseInt(elem.getAttribute("height"));

	this.move = sprite_move;
	this.is_colliding = sprite_is_colliding;
}

function sprite_move()
{
	if (level < this.min_level)
	{
		if (this.left + this.width > 0)
		{
			this.left = 0 - this.width;
			this.elem.left = this.left;
		}

		return;
	}

	this.left += (this.direction * (this.speed + level));

	if (this.direction < 0)
	{
		if (this.left < 0 - this.width)
		{
			this.left = play_area_width;
		}
	}
	else if (this.direction > 0)
	{
		if (this.left > play_area_width)
		{
			this.left = 0 - this.width;
		}
	}

	if ((this.type == 1) && (this.is_colliding(frog)) && (!ghost_cars))
	{
		frog.die();
	}
	else if ((this.type == 2) && (frog.top < 222) && (this.is_colliding(frog)))
	{
		frog.riding = this;
	}

	this.elem.left = this.left;
}

function sprite_is_colliding(object)
{
	return (
		(object.top == this.top)
		&&
		(
			((object.left < this.left + this.width - 10) && (object.left > this.left))
			||
			((object.left + object.width > this.left + 10) && (object.left + object.width < this.left + this.width))
		)
	   );
}


function load_froggr()
{
	var spriteelems = document.getElementById("playarea").getElementsByTagName("image");
	sprites = new Array();

	for (var i=0; i < spriteelems.length; i++)
	{
		var row = parseInt(spriteelems[i].getAttribute("class").substring(3));
		var direction;
		var speed;
		var type;
		var min_level = 0;

		switch (row)
		{
			case 0: direction = -1; speed = 6; type = 1; break;
			case 1: direction = 1; speed = 4; type = 1; break;
			case 2: direction = -1; speed = 8; type = 1; break;
			case 3: direction = 1; speed = 3; type = 1; break;

			case 4: direction = -1; speed = 9; type = 1; min_level = 1; break;

			case 5: direction = -1; speed = 3; type = 2; break;
			case 6: direction = 1; speed = 3; type = 2; break;
			case 7: direction = 1; speed = 4; type = 2; break;
			case 8: direction = -1; speed = 5; type = 2; break;
			case 9: direction = 1; speed = 5; type = 2; break;
			default: continue;
		}

		var sprite = new Sprite(spriteelems[i], direction, speed, type, min_level);

		sprites.push(sprite);
	}

	frog = new Frog(document.getElementById("frog"));
	fly = new Fly(document.getElementById("fly"));
	croc = new Croc(document.getElementById("croc"));

	setInterval("tick()", 50);

	new_game();
}

function add_score(points)
{
	score += points * (1 + level * 0.5);

	document.getElementById("score").setAttribute("value", (score + "").pad(6, '0', 0));
}

function add_message(message)
{
	document.getElementById("message").setAttribute("value", message);

	if (message != "")
	{
		setTimeout("add_message('')", 2000);
	}
}

function new_life()
{
	frog.new_life();
}

function new_game()
{
	clear_homes();

	level = 0;

	score = 0;
	add_score(0);

	frog.lives = 3;
	frog.new_life();

	add_message('Go!');
}

function clear_homes()
{
	for (var i=0; i<5; i++)
	{
		document.getElementById("home" + i).src = "images/goal1-empty.png";
		frog.home_occupied[i] = 0;
	}
}

function key_up()
{
	frog.go_up();
}

function key_down()
{
	frog.go_down();
}

function key_left()
{
	frog.go_left();
}

function key_right()
{
	frog.go_right();
}

function tick()
{
	for (var i=0; i<sprites.length; i++)
	{
		sprites[i].move();
	}

	if (frog.top == 0)
	{
		frog.check_is_home();
	}
	else if (frog.top < 222)
	{
		frog.check_is_riding();
	}

	if (fly_counter++ == 100)
	{
		fly_counter = 0;
		fly.toggle();
	}

	if (croc_counter++ == 120)
	{
		croc.preview();
	}
	else if (croc_counter == 150)
	{
		croc.show();
	}
	else if (croc_counter == 250)
	{
		croc_counter = 0;
		croc.hide();
	}

	frog.redraw();
}

String.prototype.pad = function(l, s, t)
{
	return s || (s = " "), (l -= this.length) > 0 ? (s = new Array(Math.ceil(l / s.length)
		+ 1).join(s)).substr(0, t = !t ? l : t == 1 ? 0 : Math.ceil(l / 2))
		+ this + s.substr(0, l - t) : this;
};
